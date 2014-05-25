var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var JobSchema = new Schema({
    company: {
        type: ObjectId,
        ref: 'Company'
    },
    toGraduating: {
        type: Boolean,
        default: false
    },
    toGraduated: {
        type: Boolean,
        default: false
    },
    payment: {
        type: String
    },
    experience: {
        type: String
    },
    locations: [{
        type: String
    }],
    skills: [{
        type: String
    }],
    desc: {
        type: String
    },
    content: {
        type: String
    },
    collects: [{
        type: ObjectId,
        ref: 'User'
    }],
    likes: [{
        type: ObjectId,
        ref: 'User'
    }],
    resumes: [{
        type: ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: ObjectId,
        ref: 'Comment'
    }],
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});

JobSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});
JobSchema.virtual('collectCount').get(function() {
    return this.collects.length;
});
JobSchema.virtual('resumeCount').get(function() {
    return this.collects.length;
});
JobSchema.virtual('type').get(function() {
    if (this.toGraduating && !this.toGraduated) {
        return 'campus';
    } else if (this.toGraduated) {
        return 'society';
    }
});

// statics
JobSchema.statics.createNew = function(obj, cb) {
    var job = new this();
    for(var key in obj) {
        job[key] = obj[key];
    }
    job.save(cb);
};
JobSchema.statics.delete = function(id, cb) {
    this.findOne({
        _id: id
    }, function(err, doc) {
        doc.remove(cb);
    });
};

// methods
JobSchema.methods.like = function(userId) {
    this.likes.push(userId);
    this.save();
};
JobSchema.methods.unLike = function(userId) {
    this.likes.splice(this.likes.indexOf(userId),1);
    this.save();
};
JobSchema.methods.collect = function(userId) {
    this.collects.push(userId);
    this.save();
};
JobSchema.methods.unCollect = function(userId) {
    this.collects.splice(this.collects.indexOf(userId),1);
    this.save();
};
JobSchema.methods.comment = function(id) {
    this.comments.push(id);
    this.save();
};
JobSchema.methods.unComment = function(id) {
    this.comments.splice(this.comments.indexOf(id),1);
    this.save();
};
JobSchema.methods.pushResume = function(userId) {
    this.resumes.push(userId);
    this.save();
};


// middleware
JobSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Job', JobSchema);