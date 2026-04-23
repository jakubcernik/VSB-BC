const express = require('express');
const path = require('path');
const app = express();
const { algorithms } = require('./data/algorithms.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.render('index', { algorithms }));

algorithms.forEach(algo => {
    app.get(algo.route, (req, res) => res.render(algo.id, { algo }));
    app.get(`${algo.route}/theory`, (req, res) => res.render(`${algo.id}-theory`, { algo }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server běží na http://localhost:${PORT}`));
