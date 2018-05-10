module.exports = function(app) {
const results = require('../controllers/results.server.controller');
app.get('/results', results.render);
app.get('/results/:template/:result', results.filter)

};

