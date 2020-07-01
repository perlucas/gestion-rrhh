const express = require('express');

/**
 * 
 * @param {
 * routes: [{
 *  path: {string},
 *  method: {string},
 *  middleware: [{function}]
 * }],
 *  all: [function]
 * } configs 
 */
module.exports.configureRouter = function (configs) {

    var router = express.Router();

    // Get all the default middlewares configured
    var defaultMiddlewares = configs.all;

    for (let config of configs.routes) {

        let routeMiddlewares = [...defaultMiddlewares]; // value copy
        
        config.middleware.forEach(mm => routeMiddlewares.push(mm));

        // i.e: router.get('/url', [fn1, fn2])
        router[config.method](config.path, routeMiddlewares);
    }

    return router;
}