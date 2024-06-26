const mongoose = require('mongoose');
const {Schema} = mongoose;

const commentSchema = new mongoose.Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    body: {
        type: String,
        required: true,
    },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;