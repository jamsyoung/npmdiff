#! /usr/bin/env node
/*jslint node: true */

'use strict';

var fs = require('fs'),
    os = require('os'),
    argv,
    exec = require('child_process').exec,
    http = require('http'),
    target1,
    target2,
    execSync = require('execSync'),
    optimist = require('optimist'),
    metaData = require('./package.json'),
    handleError,
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

handleError = function (error) {
    console.log('[ERROR] '.red + error.message);
    process.exit(1);
};

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
    handleError({ message: 'missing arguments' });
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
        handleError({ message: 'This platform is not supported.  Currently only unix platforms are supported.' });
        process.exit(1);
    }
};

processTarget = function (target) {
    var file,
        result = false,
        packageName,
        packageFilename,
        localPackageLocation,
        remotePackageLocation,
        packageNameWithVersion;

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

        /* this converts package@0.0.1 to package */
        packageName = target.replace(/@[0-9\.]+$/, '');

        /* this converts package@0.0.1 to package-0.0.1 */
        packageNameWithVersion = target.replace('@', '-');

        /* this converts package@0.0.1 to package-0.0.1.tgz */
        packageFilename = packageNameWithVersion + '.tgz';

        /* this creates http://isaacs.ic.ht/registry/package/package-0.0.1.tgz */
        remotePackageLocation = 'http://isaacs.ic.ht/registry/' + packageName + '/' + packageFilename;

        /* this creates /tmp/package-0.0.1.tgz */
        localPackageLocation = '/tmp/' + packageFilename;

        /* downloand and uncompress the remote package-0.0.1.tgz */
        file = fs.createWriteStream(localPackageLocation, { mode: '0777' });
        http.get(remotePackageLocation, function (response) {
            if (response.statusCode === 200) {

                /* delete /tmp/package-0.0.1 directory if it exists */
                if (fs.existsSync('/tmp/' + packageNameWithVersion)) {
                    fs.rmdirSync('/tmp/' + packageNameWithVersion);
                    execSync.exec('rm -r /tmp/' + packageNameWithVersion);
                }

                /* create /tmp/package-0.0.1 directory */
                fs.mkdirSync('/tmp/' + packageNameWithVersion);

                /* stream the output into /tmp/package-0.0.1.tgz */
                response.pipe(file);
                response.on('end', function () {
                    // change to synchronous
                    exec('tar xvzf ' + localPackageLocation + ' -C /tmp/' + packageNameWithVersion, function (error) {
                        if (error) {
                            handleError(error);
                        }
                        console.log('extracted to /tmp/' + packageNameWithVersion); // this is slightly wrong
                    });
                });
            } else {
                // need to determine if this is just a local reference that is not found, or a npm package that does not exist */
                handleError({ message: 'HTTP Status: ' + response.statusCode + ' ' + remotePackageLocation });
            }
        }).on('error', function (error) {
            handleError(error);
        });



        // fs.mkdir('/tmp/' + packageNameWithVersion, function (error) {
        //     if (error) {
        //         // {"errno":47,"code":"EEXIST","path":"/tmp/dust-compiler-0.0.9"}
        //         if (error.code === 'EEXIST') {
        //             // delete the error.path
        //         }
        //     }
        // });


        result = '/tmp/' + packageFilename;
    }

    return result;
};

validatePlatformSupport();

target1LocalPath = processTarget(target1);
target2LocalPath = processTarget(target2);

console.log('do the diff now');
