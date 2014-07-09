/**
 * Module dependencies.
 */

var express = require('express');
var mongoStore = require('connect-mongo')(express);
var http = require('http');
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');
var then = require('thenjs');
var config = require('./config/config.js');
var processPath = path.dirname(process.argv[1]);

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
    // express/mongo session storage
    app.use(express.session({
        secret: config.name,
        store: new mongoStore({
            url: config.db,
            collection: 'sessions'
        })
    }));
    app.use(app.router);
    app.use('/public', express.static(path.join(__dirname, 'public')));
    app.use(express.errorHandler());
});

// api
require('./api/search')(app);
require('./api/user')(app);
require('./api/job')(app);
require('./api/share')(app);
require('./api/account')(app);
require('./api/userProfile')(app);
require('./api/companyProfile')(app);
require('./api/group')(app);
require('./api/router')(app);
require('./api/json')(app);

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