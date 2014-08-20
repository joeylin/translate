var path = require('path');
var fs = require('fs');
var city = path.resolve(__dirname, '../public/data/city.json');
var province = path.resolve(__dirname, '../public/data/province.json');

module.exports = function(app) {
    fs.readFile(city, 'utf8', function(err, data) {
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
    fs.readFile(province, 'utf8', function(err, data) {
        var getProvinces = function(req, res) {
            var user = req.session.user;
            var value = req.query.value;
            var results = [];
            var provinces = JSON.parse(data);
            res.send({
                code: 200,
                content: provinces
            });
        };
        app.get('/api/json/province', getProvinces);
    });
};