var fs = require('fs'),
    path = require('path'),
    browserify = require('browserify');

module.exports = function bundle(mod) {
    // need a file to run browserify
    var entryPath = path.join(__dirname, 'entry.js'),
        outputPath = path.join(__dirname, 'output.js'),
        b = browserify();

    fs.writeFileSync(entryPath, 'var ' + mod +
                                    ' = require("' + mod + '");\n');

    b.addEntry(entryPath);

    fs.writeFileSync(outputPath, b.bundle());
}
