const mongoose = require('mongoose');
const {Schema} = mongoose;

const Comment = require('./comment');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

userSchema.post('findOneAndDelete', async user => {
    await Comment.deleteMany({ _id: { $in: user.comments } });
});

const User = mongoose.model('User', userSchema);

module.exports = User;