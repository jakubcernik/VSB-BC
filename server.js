const express = require('express');
const path = require('path');
const app = express();
const data = require('./data/algorithms.json');
const algorithms = data.algorithms;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.render('index', { algorithms: algorithms });
});

for (let i = 0; i < algorithms.length; i++) {
    const algo = algorithms[i];
    app.get(algo.route, function(req, res) {
        res.render(algo.id, { algo: algo });
    });
    app.get(algo.route + '/theory', function(req, res) {
        res.render(algo.id + '-theory', { algo: algo });
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log('Server běží na http://localhost:' + PORT);
});
