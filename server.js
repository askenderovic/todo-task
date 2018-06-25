const cluster		= require('cluster');
const requestIp		= require('request-ip');
const uuidv4		= require('uuid/v4');
const sleep			= require('system-sleep');

const port = process.env.PORT || 8081;

if (cluster.isMaster) {
	console.log(`Master process ${process.pid} is running`);

	// count the machine's CPUs
	var numCPUs = require('os').cpus().length;
	
	// fork workers
	for (let i = 0; i < numCPUs; i++) {
		var env = { uuid: uuidv4() },
			newWorker = cluster.fork(env);
		newWorker.process.env = env;
	}

	cluster.on('fork', (worker) => {
		console.log(`Worker ${worker.id} is forked PID:${worker.process.pid}, UUID:${worker.process.env.uuid}`);
	});
	
	cluster.on('listening', (worker, address) => {
		console.log(`Worker ${worker.id} is now connected to ${address.address}:${address.port}`);
	});

	// listen for dying workers
	cluster.on('exit', (worker, code, signal) => {
		console.log(`Worker ${worker.id} died`);
		
		// replace the dead worker
		var env = worker.process.env,
			newWorker = cluster.fork(env);
		newWorker.process.env = env;

	});

} else {
	var express	= require('express');
	
	// create a new Express application
	var app	= express();

	// get an instance of the express Router
	var router = express.Router();

	router.route('/')
		.get(function(req, res) {
			var workerId = cluster.worker.id,
				workerPid = cluster.worker.process.pid,
				workerUuid = cluster.worker.process.env.uuid;

			console.log(`Worker ${workerId} received request PID:${workerPid}, UUID:${workerUuid}`);

			var user = {
				"ua":	req.get('user-agent'),
				"ip":	requestIp.getClientIp(req),
				"uuid":	workerUuid
			};
			
			sleep(5000);
	
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json( user );
		});

	// all of routes will be prefixed with /api/v1
	app.use('/api/v1', router);

	// workers can share any TCP connection
	app.listen(port);
	
	console.log(`Worker process ${process.pid} started RESTful API server on port ${port}`);

}
