var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var InvitationSchema = new Schema({
    code: {
        type: String
    },
    group: {
        type: ObjectId,
        ref: 'Group'
    },
    user: {
        type: ObjectId,
        ref: 'User'
    },
    type: {
        type: String // 'user group'
    },
    content: {
        type: String
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

// statics
InvitationSchema.statics.createNew = function(obj, cb) {
    var invite = new this();
    invite.code = randomString();
    invite.group = obj.group;
    invite.user = obj.user;
    invite.type = obj.type;
    invite.content = obj.content;
    invite.save(cb);

    function randomString(size) {
        size = size || 18;
        var code_string = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var max_num = code_string.length + 1;
        var new_pass = '';
        while (size > 0) {
            new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
            size--;
        }
        return new_pass;
    }
};

// middleware
InvitationSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Invitation', InvitationSchema);