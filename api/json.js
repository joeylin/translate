var path = require('path');
var fs = require('fs');
var file = path.resolve(__dirname, '../public/data/city.json');

module.exports = function(app) {
    fs.readFile(file, 'utf8', function(err, data) {
        var getCities = function(req, res) {
            var user = req.session.user;
            var value = req.query.value;
            var results = [];
            var cities = JSON.parse(data);
            cities.map(function(city) {
                if (city.ProID == value) {
                    results.push(city);
                }
            });
            results.sort(function(a, b) {
                return a.CitySort > b.CitySort;
            });
            res.send({
                code: 200,
                content: results
            });
        };
        app.get('/api/json/city', getCities);
    });
};