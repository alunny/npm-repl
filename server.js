var app = require('tako')(),
    path = require('path')

app.route('/').files(path.join(__dirname, 'static', 'index.html'));
app.route('*').files(path.join(__dirname, 'static'));

app.httpServer.listen(8000)

console.log('Server running at http://0.0.0.0:8000/');
