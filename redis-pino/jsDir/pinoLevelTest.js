"use strict";
require('dotenv').config();
var express = require('express');
var unirest = require('unirest');
var pino = require('pino');
var logger = pino();
logger.level = 'error';
logger.info('nope'); //does not log
var child = logger.child({ foo: 'bar' });
child.info('nope again'); //does not log
child.level = 'info';
child.info('hooray'); //will log
logger.info('nope nope nope'); //will not log, level is still set to error
logger.child({ foo: 'bar', level: 'debug' }).debug('debug!');
