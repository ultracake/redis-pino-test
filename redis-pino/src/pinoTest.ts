require('dotenv').config();
const express = require('express');
const unirest = require('unirest');
const pino = require('pino');
const expressPino = require('express-pino-logger');

//user class
const user = require('./user');
var user1 = new user('jack');

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

const expressLogger = expressPino({ logger });
const PORT = process.env.PORT || 3000;
const app = express();
//app.use(expressLogger);

app.get('/', (req:any, res:any) => {

 logger.debug('test call 1');

 var user2 = new user('jackie');
 user2.changeName('cake');

 logger.info('two users: '+ user1.name +', ' + user2.name);
 
 //const child = logger.child({ a: 'property2' })
 //child.info('hello child!')
 res.status(200).json({ name: 'john' , name2: 'john' });
 //res.send('Hello World');
});

app.get('/changeName', (req:any, res:any) => {
   
    user1.changeName('fruit');
    logger.info(user1.name);

    unirest('GET', 'http://localhost:3001/mailsResults')
    .end(function (respons:any) { 
      if(respons.error) {
        logger.error('' + respons.error);
        //console.log(respons.error);
      }else{
        logger.info(respons.body);
      }
    });
    //logger.myLevel("test my level");
    res.send('name change hehe');
});

app.get('/test', (req:any, res:any) => {
    //for setting the log level
    logger.level = 'info';
    //logger.level = 'silent';
    res.send('does not diplay debug log');
});

app.get('/test2', (req:any, res:any) => {
    logger.level = 'debug';   
    res.send('does diplay debug log');
});

app.listen(PORT, () => {
 logger.info('Server running on port %d', PORT);
 //logger.info(logger);
});

module.exports = app;