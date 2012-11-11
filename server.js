var app = require('tako')(),
    path = require('path'),
    fs = require('fs'),
    marked = require('marked'),
    bundle = require('./bundle'),
    templates = app.templates,
    pages = {};

templates.directory(path.join(__dirname, 'templates'));

app.route('/').files(path.join(__dirname, 'static', 'index.html'));

app.route('/js/:module.js', function (req, res) {
    bundle(req.params.module, function (err, outputPath) {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            return res.end(err.message);
        }

        res.writeHead(200, {'Content-Type': 'text/javascript'});
        fs.createReadStream(outputPath).pipe(res);
    });
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
    // todo: get the actual README
    var mkdPath = path.join(__dirname, 'static', 'mapletree-readme.mkd');
    var readme = fs.readFileSync(mkdPath, 'utf-8');

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(marked(readme));
})

app.route('*').files(path.join(__dirname, 'static'));

app.httpServer.listen(8000)

console.log('Server running at http://0.0.0.0:8000/');
