// bundle a module for the browser, given bundle id
var fs = require('fs'),
    path = require('path'),
    browserify = require('browserify'),
    pkg = require('./packageReader'),
    reallyRequire = require('./brute-require');

module.exports = function bundle(mod, cb) {
    pkg(mod, function (err, package) {
        if (err) {
            return cb(err);
        }

        if (package.gypfile) {
            return cb({ name: 'PackageError',
                     message: 'no gyp builds allowed' });
        }

        reallyRequire(mod, function (err) {
            if (err) {
                return cb(err)
            };

            var entryPath = path.join(__dirname, 'entry.js'),
                outputPath = path.join(__dirname, mod + '-output.js'),
                b = browserify();

            fs.writeFileSync(entryPath, 'window.' + mod +
                                            ' = require("' + mod + '");\n');

            try {
                b.addEntry(entryPath);

                fs.writeFileSync(outputPath, b.bundle());
                fs.unlinkSync(entryPath);

                process.nextTick(function () {
                    cb(null, outputPath);
                });
            } catch (e) {
                cb(e);
                fs.unlinkSync(entryPath);
            }
        });
    })
}
