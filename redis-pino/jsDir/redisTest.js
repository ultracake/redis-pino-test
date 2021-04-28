"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
require('dotenv').config();
var express = require('express');
var unirest = require('unirest');
var redis = require("redis");
var pino = require('pino');
var expressPino = require('express-pino-logger');
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
//creates a redis client 
var client = redis.createClient({
    port: 6379
    //host      : 'redis'
});
client.on("error", function (err) {
    logger.error(err);
});
var publisher = redis.createClient();
publisher.on("error", function (err) {
    logger.error(err);
});
var expressLogger = expressPino({ logger: logger });
var PORT = process.env.PORT || 3000;
var app = express();
//app.use(expressLogger);
app.listen(PORT, function () {
    logger.info('Server running on port %d', PORT);
    //logger.info(logger);
});
app.get('/', function (req, res) {
    publisher.publish("notification", 'Hi, cake is good!', function () {
        logger.info("sending messages to all subscribers!");
    });
    res.send('Hello World');
});
app.get('/recipe/:fooditem', function (req, res) {
    try {
        var fooditem = req.params.fooditem;
        unirest('GET', "http://www.recipepuppy.com/api/?q=" + fooditem)
            .end(function (respons) {
            if (respons.error) {
                logger.error('' + respons.error);
            }
            else {
                //logger.info(respons.body);
                logger.info("successful got the recipe");
                res.send(respons.body);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});
app.get('/recipeRedis/:fooditem', function (req, res) {
    try {
        var foodItem_1 = req.params.fooditem;
        // Check the redis store for the data first
        client.get(foodItem_1, function (err, recipe) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!recipe) return [3 /*break*/, 1];
                        logger.info("recipe for " + foodItem_1 + " already in the cache");
                        return [2 /*return*/, res.status(200).send({
                                error: false,
                                message: "Recipe for " + foodItem_1 + " from the cache",
                                data: JSON.parse(recipe)
                            })];
                    case 1: // When the data is not found in the cache then we can make request to the server
                    return [4 /*yield*/, unirest('GET', "http://www.recipepuppy.com/api/?q=" + foodItem_1)
                            .end(function (respons) {
                            if (respons.error) {
                                logger.error('' + respons.error);
                            }
                            else {
                                //logger.info(respons.body);
                                logger.info("successful got the recipe for " + foodItem_1 + " first time");
                                var recipe_1 = respons.body;
                                // save the record in the cache for subsequent request
                                //The setex method of the redis client is used to set the key to hold a string value in the store for a particular number of seconds which in this case is 1440 (24 minutes).
                                client.setex(foodItem_1, 1440, JSON.stringify(recipe_1));
                                // return the result to the client
                                return res.status(200).send({
                                    error: false,
                                    message: "Recipe for " + foodItem_1 + " from the server",
                                    data: recipe_1
                                });
                            }
                        })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    }
    catch (error) {
        console.log(error);
    }
});
