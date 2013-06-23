#! /usr/bin/env node
/*jslint node: true */

'use strict';

var argv,
    optimist = require('optimist'),
    metaData = require('./package.json');

argv = optimist
    .usage('Usage: npmdiff target1 target2')
    .alias('version', 'v')
    .describe('version', 'Show the current version')
    .argv;

if (argv.v) {
    console.log('npmdiff v' + metaData.version);
    process.exit();
}
