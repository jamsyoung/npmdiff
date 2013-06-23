/*jslint node: true */
/*global suite, setup, test */
'use strict';

var chai = require('chai'),
    assert = chai.assert,
    execSync = require('execSync');

suite('npmdiff tests', function () {

    var npmdiffPackageData;


    setup(function () {
        npmdiffPackageData = require('../package.json');
    });


    test('version is output from -v flag', function () {
        var result = execSync.exec("$PWD/npmdiff.js -v");
        assert.strictEqual(result.stdout, 'npmdiff v' + npmdiffPackageData.version + '\n');
    });


    test('version is output from --version flag', function () {
        var result = execSync.exec("$PWD/npmdiff.js --version");
        assert.strictEqual(result.stdout, 'npmdiff v' + npmdiffPackageData.version + '\n');
    });

});
