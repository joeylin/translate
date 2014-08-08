var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var GroupSchema = new Schema({
    is_public: {
        type: Boolean,
        default: false
    },
    total: {
        type: Number // 限制成员的总人数
    },
    intro: {
        type: String
    },
    id: {
        type: Number
    },
    name: {
        type: String
    },
    type: {
        type: String
    },
    industry: {
        type: String
    },
    avatar: {
        type: String,
        default: '/public/imgs/group.png'
    },
    announcement: {
        type: String
    },
    admin: [{
        type: ObjectId,
        ref: 'User'
    }],
    creator: {
        type: ObjectId,
        ref: 'User'
    },
    members: [{
        type: ObjectId,
        ref: 'User'
    }],
    hire: [{
        location: String,
        position: String,
        link: String,
        by: {
            type: ObjectId,
            ref: 'User'
        },
        date: Date
    }],
    followCount: {
        type: Number,
        default: 0
    },
    is_delete: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});

// virtual
GroupSchema.virtual('count').get(function() {
    return this.members.length + this.admin.length + 1;
});

// statics
GroupSchema.statics.createNew = function(obj, cb) {
    var group = new this();
    var User = mongoose.model('User');
    group.name = obj.name;
    group.creator = obj.creator;
    group.is_public = obj.is_public;
    group.announcement = obj.announcement;
    group.intro = obj.intro;
    group.avatar = obj.avatar;
    group.industry = obj.industry;
    var IdGenerator = mongoose.model('IdGenerator');
    IdGenerator.getNewId('group', function(err, doc) {
        User.joinGroup(obj.creator, group._id, function(err, user) {
            if (user.groups.create.length > 4) {
                return cb(null, null);
            }
            user.groups.create.push(group._id);
            user.save(function(err) {
                group.id = doc.currentId;
                group.save(cb);
            });
        });
    });
};
GroupSchema.statics.getJoined = function(id, limit, cb) {
    var count = limit || 8;
    var query = {
        $or: [{
            creator: id
        }, {
            admin: id
        }, {
            members: id
        }]
    };
    this.find(query).sort('-createAt').limit(count).exec(cb);
};
GroupSchema.statics.delete = function(id, userId, cb) {
    this.findOne({
        _id: id
    }, function(err, group) {
        if (group.user.toString() == userId) {
            group.is_delete = true;
            group.save(cb);
        } else {
            cb({
                info: 'no auth'
            });
        }
    });
};
GroupSchema.statics.join = function(id, userId, cb) {
    this.findOne({
        _id: id
    }, function(err, group) {
        if (group.isJoined(userId)) {
            cb(null, null);
        } else {
            var User = mongoose.model('User');
            User.joinGroup(userId, id, function(err) {
                group.members.push(userId);
                group.save(cb);
            });
        }
    });
};
GroupSchema.statics.quit = function(id, userId, cb) {
    this.findOne({
        _id: id
    }, function(err, group) {
        var index = -1;
        var User = mongoose.model('User');
        group.members.map(function(member, key) {
            if (member.toString() == userId) {
                index = key;
            }
        });
        if (index === -1) {
            if (group.isAdmin(userId)) {
                var adminIndex = group.admin.indexOf(userId);
                group.admin.splice(adminIndex, 1);
                return User.quitGroup(userId, id, function(err) {
                    group.save(cb);
                });
            }
            if (group.isCreator(userId)) {
                group.creator = '';
                return User.quitGroup(userId, id, function(err) {
                    group.save(cb);
                });
            }
            return cb(null, null);
        } else {
            group.members.splice(index, 1);
            return User.quitGroup(userId, id, function(err) {
                group.save(cb);
            });
        }
    });
};
GroupSchema.statics.getPopular = function(cb) {
    this.find().sort({
        'members.length': -1
    }).limit(20).exec(function(err, groups) {
        cb(err, groups);
    });
};

// methods
GroupSchema.methods.isJoined = function(userId) {
    var group = this.toJSON();
    if (this.creator.toString() == userId) {
        return true;
    }
    var index = -1;
    group.admin.map(function(item, key) {
        if (item.toString() == userId) {
            index = key;
        }
    });
    group.members.map(function(item, key) {
        if (item.toString() == userId) {
            index = key;
        }
    });
    if (index > -1) {
        return true;
    }
    return false;
};
GroupSchema.methods.isAdmin = function(userId) {
    var index = -1;
    if (this.creator.toString() == userId) {
        return true;
    }
    this.admin.map(function(member, key) {
        if (member.toString() == userId) {
            index = key;
        }
    });
    if (index > -1) {
        return true;
    } else {
        return false;
    }
};
GroupSchema.methods.isCreator = function(userId) {
    if (this.creator.toString() == userId) {
        return true;
    } else {
        return false;
    }
};
GroupSchema.methods.deleteMember = function(userId, cb) {
    var index = -1;
    var User = mongoose.model('User');
    var groupId = this._id;
    this.members.map(function(item, key) {
        if (item.toString() == userId) {
            index = key;
        }
    });
    if (index > -1) {
        this.members.splice(index, 1);
        this.save(function(err) {
            User.quitGroup(userId, groupId.toString(), cb);
        });
    } else {
        cb(null, null);
    }
};
GroupSchema.methods.deleteAdmin = function(userId, cb) {
    var index = -1;
    this.admin.map(function(item, key) {
        if (item.toString() == userId) {
            index = key;
        }
    });
    if (index > -1) {
        this.members.push(this.admin[index]);
        this.admin.splice(index, 1);
        this.save(cb);
    } else {
        cb(null, null);
    }
};
GroupSchema.methods.addAdmin = function(userId, cb) {
    var index = -1;
    this.members.map(function(item, key) {
        if (item.toString() == userId) {
            index = key;
        }
    });
    if (index > -1) {
        this.members.splice(index, 1);
        this.admin.push(userId);
        this.save(cb);
    } else {
        cb(null, null);
    }
};


// middleware
GroupSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Group', GroupSchema);