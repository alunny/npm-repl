var npm = require('npm'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    installerInstance;

function Installer() {
    EventEmitter.call(this);
    this.inProcess = {};
}

util.inherits(Installer, EventEmitter);

Installer.prototype.install = function (module, cb) {
    var self = this;

    npm.load({ loglevel: 'silent' }, function (err) {
        if (err) {
            cb(err);
        }

        self.inProcess[module] = true;

        npm.commands.install([module], function (err, data) {
            self.inProcess[module] = null;

            if (err) {
                cb(err);
            }

            self.emit('installed', module);

            process.nextTick(cb);
        });
    })
}

Installer.prototype.isInstalling = function (module) {
    return !!(this.inProcess[module]);
}

module.exports = function getInstaller() {
    if (!installerInstance) {
        installerInstance = new Installer;
    }

    return installerInstance;
}
