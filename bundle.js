// bundle a module for the browser, given bundle id
var fs = require('fs'),
    path = require('path'),
    browserify = require('browserify'),
    npm = require('npm');

module.exports = function bundle(mod, cb) {
    function bundleOutput() {
        var entryPath = path.join(__dirname, 'entry.js'),
            outputPath = path.join(__dirname, mod + '-output.js'),
            b = browserify();

        fs.writeFileSync(entryPath, 'window.' + mod +
                                        ' = require("' + mod + '");\n');

        try {
            b.addEntry(entryPath);

            fs.writeFileSync(outputPath, b.bundle());
            fs.unlinkSync(entryPath);
        } catch (e) {
            cb(e);
        }

        process.nextTick(function () {
            cb(null, outputPath);
        });
    }

    // first off - resolve dependency
    try {
        require(mod);
        process.nextTick(bundleOutput);
    } catch (e) {
        console.log(mod + ' not installed')

        npm.load({ loglevel: 'silent' }, function (err) {
            if (err) {
                throw err
            }

            npm.commands.install([mod], function (err, data) {
                if (err) {
                    throw err;
                }

                process.nextTick(bundleOutput);
            });
        })
    }
}
