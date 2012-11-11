var app = require('tako')(),
    path = require('path'),
    fs = require('fs'),
    marked = require('marked'),
    bundle = require('./bundle'),
    package = require('./packageReader'),
    templates = app.templates,
    tmpdir = process.env['TMPDIR'],
    failures = {};

templates.directory(path.join(__dirname, 'templates'));

app.route('/').files(path.join(__dirname, 'static', 'index.html'));

app.route('/js/:module.js', function (req, res) {
    var mod = req.params.module,
        cachedPath = path.join(tmpdir, mod + '.js');

    if (fs.existsSync(cachedPath)) {
        console.log('reading ' + mod + ' from tmpdir');

        res.writeHead(200, {'Content-Type': 'text/javascript'});
        fs.createReadStream(cachedPath).pipe(res);
    } else if (failures[mod]) {
        console.log('reading ' + mod + ' error from cache');

        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(failures[mod]);
    } else if (mod == 'hoarders') {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('lol no way bro');
    } else {
        bundle(mod, function (err, outputPath) {
            if (err) {
                failures[mod] = err.message;
                return fiveHundred(err, res);
            }

            res.writeHead(200, {'Content-Type': 'text/javascript'});
            fs.createReadStream(outputPath).pipe(res);

            fs.createReadStream(outputPath)
                .pipe(fs.createWriteStream(cachedPath));
        });
    };
}).methods('GET');

app.route('/repl/:module', function (req, res) {
    var page = app.page();

    page.template('repl.html.mustache')
    page.results = req.params;

    page.pipe(res);
}).methods('GET');

app.route('/iframe/:module', function (req, res) {
    var page = app.page();

    page.template('iframe.html.mustache')
    page.results = req.params;

    page.pipe(res);
}).methods('GET');

app.route('/readme/:module', function (req, res) {
    var mod = req.params.module,
        cachedPath = path.join(tmpdir, mod + '.html');

    if (fs.existsSync(cachedPath)) {
        console.log('reading ' + mod + ' readme from tmpdir');

        res.writeHead(200, {'Content-Type': 'text/javascript'});
        fs.createReadStream(cachedPath).pipe(res);
    } else {
        package(mod, function (err, package) {
            var readme;

            if (err) {
                return fiveHundred(err, res);
            }

            if (!package.readme) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('No README found');
            } else {
                readme = marked(package.readme);

                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(readme);

                fs.writeFile(cachedPath, readme, function (err) {
                    if (err) { console.log(err); }
                });
            }
        });
    };
})

app.route('*').files(path.join(__dirname, 'static'));

app.httpServer.listen(8000)

console.log('Server running at http://0.0.0.0:8000/');

function fiveHundred(err, res) {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    return res.end(err.message);
}
