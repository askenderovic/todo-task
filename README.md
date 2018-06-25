# Todo Task

## Introduction

This Node.JS example runs multiple workers to handle REST requests. When started the service starts as many workers as processor cores are present on the host machine.

## API description

The interface is accessible on following url.

```
GET http://localhost:8081/api/v1
```

The returned response is in JSON format as:

```json
{
   "ua":    "<user-agent>",
   "ip":    "<client-ip>",
   "uuid":  "<worker-uuid>"
}
```

## Run as Node.JS process

To run application download the repository content and run bellow commands in destination directory.

```
npm install
npm start
```

## Run as Docker application

To build the image run the following command to build the Docker image. The -t flag lets tag the image so it's easier to find later using the docker images command:

```
$ docker build -t <your username>/todo-task .
```

Running the image with -d runs the container in detached mode, leaving the container running in the background. The -p flag redirects a public port to a private port inside the container. To run the image previously built run following command:

```
$ docker run -e "NODE_ENV=production" -u "node" -m "300M" --memory-swap "1G" -p 49160:8081 -d <your username>/todo-task
```

To print the output of the app:
```
# Get container ID
$ docker ps

# Print app output
$ docker logs <container id>
```

## Test

In the example above, Docker mapped the 8081 port inside of the container to the port 49160 on host machine.
The app can be called using curl
```
$ curl -i http://localhost:49160/api/v1/
```


