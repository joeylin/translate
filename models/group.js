var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var GroupSchema = new Schema({
    id: {
        type: Number
    },
    name: {
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

GroupSchema.virtual('mCount').get(function() {
    return this.members.length;
});
GroupSchema.virtual('pCount').get(function() {
    return this.members.length;
});

// statics
GroupSchema.statics.createNew = function(obj, cb) {
    var group = new this();
    group.name = obj.name;
    group.creator = obj.creator;
    group.announcement = obj.announcement;
    group.avatar = obj.avatar;
    group.industry = obj.industry;
    var IdGenerator = mongoose.model('IdGenerator');
    IdGenerator.getNewId('group', function(err, doc) {
        group.id = doc.currentId;
        group.save(cb);
    });
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
            group.members.push(userId);
            group.save(cb);
        }

    });
};
GroupSchema.statics.quit = function(id, userId, cb) {
    this.findOne({
        _id: id
    }, function(err, group) {
        var index = -1;
        group.members.map(function(member, key) {
            if (member.toString() == userId) {
                index = key;
            }
        });
        if (index === -1) {
            if (group.isAdmin(userId)) {
                var adminIndex = group.admin.indexOf(userId);
                group.admin.splice(adminIndex, 1);
                return group.save(cb);
            }
            if (group.isCreator(userId)) {
                group.creator = '';
                return group.save(cb);
            }
            return cb(null, null);
        } else {
            group.members.splice(index, 1);
            group.save(cb);
        }
    });
};
GroupSchema.statics.getLastest = function(cb) {
    this.find().sort({
        createAt: -1
    }).limit(6).exec(function(err, groups) {
        if (!groups || err) {
            cb(err, null);
        }
        cb(err, groups);
    });
};
GroupSchema.statics.getPopular = function(cb) {
    this.find().sort({
        'members.length': -1
    }).limit(6).exec(function(err, groups) {
        cb(err, groups);
    });
};

// methods
GroupSchema.methods.isJoined = function(userId) {
    var group = this.toObject();
    if (this.creator.toString() == userId) {
        return true;
    }
    if (group.admin.indexOf(userId) >= 0) {
        return true;
    }
    if (group.members.indexOf(userId) >= 0) {
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
    if (index >= 0) {
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
    if (this.isJoined(userId)) {
        var index = this.members.indexOf(userId);
        this.members.splice(index, 1);
        this.save(cb);
    } else {
        cb(null, null);
    }
};
GroupSchema.methods.deleteAdmin = function(userId, cb) {
    if (this.isAdmin(userId)) {
        var index = this.admin.indexOf(userId);
        this.admin.splice(index, 1);
        this.members.push(userId);
        this.save(cb);
    } else {
        cb(null, null);
    }
};
GroupSchema.methods.addAdmin = function(userId, cb) {
    if (this.isAdmin(userId) && !this.isJoined(userId)) {
        cb(null, null);
    } else {
        var index = this.members.indexOf(userId);
        this.members.splice(index, 1);
        this.admin.push(userId);
        this.save(cb);
    }
};


// middleware
GroupSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Group', GroupSchema);