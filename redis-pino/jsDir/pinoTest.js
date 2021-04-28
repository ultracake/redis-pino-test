"use strict";
require('dotenv').config();
var express = require('express');
var unirest = require('unirest');
var pino = require('pino');
var expressPino = require('express-pino-logger');
//user class
var user = require('./user');
var user1 = new user('jack');
//pino
var logger = pino({
    //name: 'myapp',
    level: 'info',
    //safe: true, //avoid error causes by circular references in the object tree, default true
    prettyPrint: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        levelFirst: true // --levelFirst 
        //ignore: 'pid,hostname' 
    }
});
var expressLogger = expressPino({ logger: logger });
var PORT = process.env.PORT || 3000;
var app = express();
//app.use(expressLogger);
app.get('/', function (req, res) {
    logger.debug('test call 1');
    var user2 = new user('jackie');
    user2.changeName('cake');
    logger.info('two users: ' + user1.name + ', ' + user2.name);
    //const child = logger.child({ a: 'property2' })
    //child.info('hello child!')
    res.status(200).json({ name: 'john', name2: 'john' });
    //res.send('Hello World');
});
app.get('/changeName', function (req, res) {
    user1.changeName('fruit');
    logger.info(user1.name);
    unirest('GET', 'http://localhost:3001/mailsResults')
        .end(function (respons) {
        if (respons.error) {
            logger.error('' + respons.error);
            //console.log(respons.error);
        }
        else {
            logger.info(respons.body);
        }
    });
    //logger.myLevel("test my level");
    res.send('name change hehe');
});
app.get('/test', function (req, res) {
    //for setting the log level
    logger.level = 'info';
    //logger.level = 'silent';
    res.send('does not diplay debug log');
});
app.get('/test2', function (req, res) {
    logger.level = 'debug';
    res.send('does diplay debug log');
});
app.listen(PORT, function () {
    logger.info('Server running on port %d', PORT);
    //logger.info(logger);
});
module.exports = app;
