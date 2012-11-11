var request = require('request')

module.exports = function package(module, callback) {
    request('https://registry.npmjs.org/' + module, function (err, res) {
        if (err) { callback(err); }

        console.log('response size is ' + res.body.length);

        var pkg = JSON.parse(res.body),
            latestVersion = pkg['dist-tags'].latest;

        callback(null, pkg.versions[latestVersion]);
    });
}
