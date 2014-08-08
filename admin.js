// 管理工具
// 用来生产邀请码，验证码

var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;
var Group = Models.Group;
var Invitation = Models.Invitation;
var middleware = require('./middleware');

var async = require('async');


