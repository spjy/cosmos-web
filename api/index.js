var express = require('express');
var app = express();
var path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all route exposing compiled React app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist', '/index.html'));
});

// Listen on specified port & notify
app.listen(8080, () => console.log('Listening on http://localhost:8080'));
