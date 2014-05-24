var Models = require('../models');
var Doc = Models.Doc;
var Chapter = Models.Chapter;
var Section = Models.Section;
var Translate = Models.Translate;
var User = Models.User;

var getShareByUser = function(req, res) {

};

module.exports = function(app) {
    app.get('/api/user/share', getShareByUser);
};