var Installer = require('./installer')();

module.exports = function reallyRequire(module, cb) {
    // first off - resolve dependency
    try {
        require(module);
        process.nextTick(cb);
    } catch (e) {
        console.log(module + ' not installed')

        if (Installer.isInstalling(module)) {
            console.log('wait for installer');

            function installCheck (moduleId) {
                if (moduleId == module) {
                    console.log('installer has installed ' + module);
                    process.nextTick(cb);
                    Installer.removeListener('installed', installCheck);
                }
            }

            Installer.on('installed', installCheck);
        } else {
            Installer.install(module, cb);
        }
    }
}
