const cluster		= require('cluster');
const requestIp		= require('request-ip');
const uuidv4		= require('uuid/v4');

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

	// get an instace of the express Router
	var router = express.Router();

	router.route('/')
		.get(function(req, res) {
			var worker = cluster.worker;

			console.log(`Worker ${worker.id} received request UUID:${worker.process.env.uuid}`);

			var user = {
				"ua":	req.get('user-agent'),
				"ip":	requestIp.getClientIp(req),
				"uuid":	worker.process.env.uuid
			};
			
			// task to put load on CPU core and simulate blockong of the event loop
			function fibo (n) {
				return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
			}
			
			fibo(40);
	
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json( user );
			
			console.log(`Worker ${worker.id} sent response UUID:${worker.process.env.uuid}`);
			
		});

	// all of routes will be prefixed with /api/v1
	app.use('/api/v1', router);

	// workers can share any TCP connection
	app.listen(port);
	
	console.log(`Worker ${cluster.worker.id} started RESTful API server on port ${port}`);

}
