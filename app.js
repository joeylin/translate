/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');
var then = require('thenjs');
var config = require('./config');
var processPath = path.dirname(process.argv[1]);
// var routes = require('./routes');
var api = require('./api/index');

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.engine('html', ejs.__express);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.cookie.secret));
    app.use(app.router);
    app.use('/public', express.static(path.join(__dirname, 'public')));
    app.use(express.errorHandler());
});

// routes
// routes(app);

// api
api(app);

then.parallel([
    function(defer) {
        fs.readFile(processPath + '/public/index.html', 'utf8', defer);
    },
    function(defer) {
        fs.readFile(processPath + '/public/home.html', 'utf8', defer);
    },
    function(defer) {
        fs.readFile(processPath + '/public/search.html', 'utf8', defer);
    }
]).then(function(defer,result) {
    var index = result[0];
    var home = result[1];
    var search = result[2];

    app.get('/:doc/:chapter', function(req,res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(index);
    });
    app.get('/login', function(req,res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(index);
    });
    app.get('/register', function(req,res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(index);
    });
    app.get('/home', function(req,res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(home);
    });
    app.get('/search', function(req,res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(search);
    });
});

    

app.locals.formatTimestamp = function(t) {
    function n2(v) {
        return v < 10 ? '0' + v : v;
    }
    var d = new Date(t * 1000);
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
        d.getHours() + ':' + n2(d.getMinutes());
};

app.locals.config = config;

// process.version = config.api.version;

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});