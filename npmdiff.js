#! /usr/bin/env node
/*jslint node: true */

'use strict';

var fs = require('fs'),
    os = require('os'),
    argv,
    http = require('http'),
    target1,
    target2,
    optimist = require('optimist'),
    metaData = require('./package.json'),
    processTarget,
    platformSupport,
    target1LocalPath,
    target2LocalPath,
    validatePlatformSupport;

require('colors');

argv = optimist
    .usage('Usage:\n npmdiff target1 target2\n npmdiff [--help|-h]\n npmdiff [--version|-v]')
    .alias('help', 'h').describe('help', 'Show this help')
    .alias('version', 'v').describe('version', 'Show the current version')
    .argv;

/* handle -v|--version arguments */
if (argv.v) {
    console.log('npmdiff v' + metaData.version);
    process.exit(0);
}

/* handle -h|--help arguments */
if (argv.h) {
    optimist.showHelp();
    process.exit(0);
}

/* handle required target1 and target 2 arguments */
if (argv._.length !== 2) {
    console.log('[ERROR] '.red + 'missing arguments');
    optimist.showHelp();
    process.exit(1);
} else {
    target1 = argv._[0];
    target2 = argv._[1];
}


platformSupport = function (platform) {
    /*
     * I *think* these are all of the possible values for process.platform (which os.platform inherits)
     * "darwin","linux","win32","solaris","haiku","sunos","freebsd","openbsd","netbsd"
     */
    var response = false;
    if (platform !== 'win32') {
        response =  true;
    }

    return response;
};

validatePlatformSupport = function () {
    if (!platformSupport(os.platform)) {
        console.log('[ERROR] '.red + 'This platform is not supported.  Currently only unix platforms are supported.');
        process.exit(1);
    }
};

processTarget = function (target) {
    var file,
        result = false,
        packageName,
        packageFilename,
        localPackagePath,
        remotePackagePath;

    if (fs.existsSync(target)) {
        /*
         * target is an existing directory
         * 1. confirm it is an npm package (check for package.json)
         * 2. npm pack it, this weeds out the files listed in .npmignore
         * 3. extract it to /tmp/packagename-version/package
         */
        result = target;
    } else {
        /*
         * target should be an existing npm package, in the public npm repository
         * 1. pull the package down from the public npm repository
         * 2. extract it to /tmp/packagename-version/package
         */
        packageName = target.replace(/@[0-9\.]+$/, '');
        packageFilename = target.replace('@', '-') + '.tgz';
        remotePackagePath = 'http://isaacs.ic.ht/registry/' + packageName + '/' + packageFilename;
        localPackagePath = '/tmp/' + packageFilename;

        file = fs.createWriteStream(localPackagePath);

        http.get(remotePackagePath, function (response) {
            if (response.statusCode === 200) {
                response.pipe(file);
                // exec('tar xvzf ' + localPackagePath + ' -C /tmp', function (error, stdout, stderr) {
                //     console.log('extracted to /tmp/package');
                // });
            } else {
                console.log('[ERROR] '.red + 'HTTP Status: ' + response.statusCode + ' ' + remotePackagePath);
                process.exit(1);
            }
        }).on('error', function (error) {
            console.log('[ERROR] '.red + error.message);
        });

        result = '/tmp/' + packageFilename;
    }

    return result;
};

validatePlatformSupport();

target1LocalPath = processTarget(target1);
target2LocalPath = processTarget(target2);

console.log('do the diff now');


