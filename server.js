var app = require('tako')(),
    path = require('path'),
    fs = require('fs'),
    bundle = require('./bundle');

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

app.route('*').files(path.join(__dirname, 'static'));

app.httpServer.listen(8000)

console.log('Server running at http://0.0.0.0:8000/');
