## Todo Task

This Node.js example runs multiple workers to handle REST requests. When started the interface is accessible on following url.

```
GET http://localhost:8081/api/v1/user
```

The returned response is in JSON format as:

```json
{
   "ua":    "<user-agent>",
   "ip":    "<client-ip>",
   "uuid":  "<worker-uuid>"
}
```
