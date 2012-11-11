var app = require('tako')(),
    path = require('path'),
    fs = require('fs'),
    marked = require('marked'),
    bundle = require('./bundle'),
    package = require('./packageReader'),
    templates = app.templates,
    tmpdir = process.env['TMPDIR'],
    pages = {};

templates.directory(path.join(__dirname, 'templates'));

app.route('/').files(path.join(__dirname, 'static', 'index.html'));

app.route('/js/:module.js', function (req, res) {
    var cachedPath = path.join(tmpdir, module + '.js');

    if (fs.existsSync(cachedPath)) {
        console.log('reading ' + module + ' from tmpdir');

        res.writeHead(200, {'Content-Type': 'text/javascript'});
        fs.createReadStream(cachedPath).pipe(res);
    } else if (req.params.module == 'hoarders') {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('lol no way bro');
    } else {
        bundle(req.params.module, function (err, outputPath) {
            if (err) {
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
    package(req.params.module, function (err, package) {
        if (err) {
            return fiveHundred(err, res);
        }

        if (!package.readme) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('No README found');
        } else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(marked(package.readme));
        }
    });
})

app.route('*').files(path.join(__dirname, 'static'));

app.httpServer.listen(8000)

console.log('Server running at http://0.0.0.0:8000/');

function fiveHundred(err, res) {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    return res.end(err.message);
}
