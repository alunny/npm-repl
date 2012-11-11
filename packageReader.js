var reallyRequire = require('./brute-require');

module.exports = function package(module, callback) {
    reallyRequire(module, function (err) {
        if (err) { callback(err); }

        callback(null, require(module + '/package'));
    });
}
