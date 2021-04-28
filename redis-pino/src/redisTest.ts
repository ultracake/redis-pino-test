require('dotenv').config();
const express = require('express');
const unirest = require('unirest');
const redis = require("redis");
const pino = require('pino');
const expressPino = require('express-pino-logger');

//pino
var logger = pino({
    //name: 'myapp',
    level:'info',
    //safe: true, //avoid error causes by circular references in the object tree, default true
    prettyPrint: { 
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss', //(-t): Translate the epoch time value into a human readable date and time string.
        levelFirst: true // --levelFirst 
        //ignore: 'pid,hostname' 
    }
 },
 //pino.destination("./pino-logger.log") //if you want to save a local log from pino. 
);

//creates a redis client 
const client = redis.createClient({
  port      : 6379
  //host      : 'redis'
});
client.on("error", (err:any) => {
  logger.error(err);
});

var publisher = redis.createClient();
publisher.on("error", (err:any) => {
    logger.error(err);
  });

const expressLogger = expressPino({ logger });
const PORT = process.env.PORT || 3000;
const app = express();
//app.use(expressLogger);

app.listen(PORT, () => {
    logger.info('Server running on port %d', PORT);
    //logger.info(logger);
});

app.get('/', (req:any, res:any) => {

 publisher.publish("notification", 'Hi, cake is good!', function(){
    logger.info("sending messages to all subscribers!");
 });

 res.send('Hello World');
});

app.get('/recipe/:fooditem', (req:any, res:any) => {
  try {
    const fooditem = req.params.fooditem;
    unirest('GET', `http://www.recipepuppy.com/api/?q=${fooditem}`)
    .end(function (respons:any) { 
      if(respons.error) {
        logger.error('' + respons.error);
      }else{
        //logger.info(respons.body);
        logger.info("successful got the recipe");
        res.send(respons.body);
      }
    });
  } catch (error) {
      console.log(error)
  }
 });

 app.get('/recipeRedis/:fooditem', (req:any, res:any) => {
    try {
      const foodItem = req.params.fooditem;
    
      // Check the redis store for the data first
      client.get(foodItem, async (err:any, recipe:any) => {
        if (recipe) {
          logger.info(`recipe for ${foodItem} already in the cache`);
          return res.status(200).send({
            error: false,
            message: `Recipe for ${foodItem} from the cache`,
            data: JSON.parse(recipe)
          })
        } else { // When the data is not found in the cache then we can make request to the server
            await unirest('GET', `http://www.recipepuppy.com/api/?q=${foodItem}`)
            .end(function (respons:any) { 
              if(respons.error) {
                logger.error('' + respons.error);
              }else{
                //logger.info(respons.body);
                logger.info(`successful got the recipe for ${foodItem} first time`);
                const recipe = respons.body;
                
                // save the record in the cache for subsequent request
                //The setex method of the redis client is used to set the key to hold a string value in the store for a particular number of seconds which in this case is 1440 (24 minutes).
                client.setex(foodItem, 1440, JSON.stringify(recipe));
    
                // return the result to the client
                return res.status(200).send({
                    error: false,
                    message: `Recipe for ${foodItem} from the server`,
                    data: recipe
                    });
                }
            });
        }
      }) 
    } catch (error) {
        console.log(error)
    }
});

