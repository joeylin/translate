var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TopicCollectSchema = new Schema({
    user_id: {
        type: String
    },
    collect_name: {
        type: String
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('TopicCollect', TopicCollectSchema);