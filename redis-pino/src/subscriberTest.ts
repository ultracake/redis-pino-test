
const redis = require("redis");
var subscriber = redis.createClient();

subscriber.on("message", function (channel, message) {
 console.log("Message: " + message + "\nOn channel: " + channel);
});
subscriber.subscribe("notification");