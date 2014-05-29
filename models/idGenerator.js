var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var IdGeneratorSchema = new Schema({
    name: {
        type: String
    },
    currentId: {
        type: Number,
        default: 502104
    }
});
IdGeneratorSchema.statics.getNewId = function(name, cb) {
    var self = this;
    this.findOne({
        name: name
    }, function(err, doc) {
        if (doc) {
            doc.currentId += 1;
        } else {
            doc = new self();
            doc.name = name;
        }
        doc.save(function(err, _doc) {
            cb(err, _doc);
        });
    });
};
mongoose.model('IdGenerator', IdGeneratorSchema);