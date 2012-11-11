var npm = require('npm');

module.exports = function reallyRequire(module, cb) {
    // first off - resolve dependency
    try {
        require(module);
        process.nextTick(cb);
    } catch (e) {
        console.log(module + ' not installed')

        npm.load({ loglevel: 'silent' }, function (err) {
            if (err) {
                throw err
            }

            npm.commands.install([module], function (err, data) {
                if (err) {
                    throw err;
                }

                process.nextTick(cb);
            });
        })
    }
}
