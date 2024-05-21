const express = require("express");
const app = express();
const ejs = require("ejs");
const ejsMate = require('ejs-mate');
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require('mongoose');

const Comment = require('./models/comment');
const User = require('./models/user');

const AppError = require('./errors/AppError');
const wrapHandler = require('./errors/wrapHandler');

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
// app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/my-comments')
    .then(() => {
        console.log("Mongo connection open!");
    })
    .catch(err => {
        console.log("Mongo connection error!");
        console.log(err);
    });

const portNum = 8080;
app.listen(portNum, () => {
    console.log(`Listening on port ${portNum}`);
})

// Home Route:

app.get("/home", (req, res) => {
    res.render("home");
})

// User Routes:

app.get('/users', wrapHandler(async (req, res) => {
    const users = await User.find();
    res.render('users/index', {users});
}))

app.get("/users/new", (req, res) => {
    res.render("users/new");
})

app.post("/users", wrapHandler(async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.redirect(`/users/${newUser._id}`);
}))

app.get("/users/:userID", wrapHandler(async (req, res) => {
    const {userID} = req.params;
    const user = await User.findById(userID).populate('comments');
    if(!user) {
        throw new AppError('User not found', 404);
    }
    res.render('users/show', {user});
}))

// GET /users/:userID/edit and PATCH /users/:userID not required
// because user only has one attribute (username) and that can't be changed

app.delete('/users/:userID', wrapHandler(async (req, res) => {
    const {userID} = req.params;
    await User.findByIdAndDelete(userID);
    res.redirect('/users');
}))

// Routes Accessing Comment Through User:

// /users/:userID/comments -> not required because comments are shown on /user/:userID
// if user model has a lot of attributes, then comments should be its own route

app.get('/users/:userID/comments/new', wrapHandler(async (req, res) => {
    const {userID} = req.params;
    const user = await User.findById(userID);
    if(!user) {
        throw new AppError('User not found', 404);
    }
    res.render('comments/new', { user });
}))

app.post('/users/:userID/comments', wrapHandler(async (req, res) => {
    const {userID} = req.params;
    const user = await User.findById(userID);
    if(!user) {
        throw new AppError('User not found', 404);
    }
    const newComment = new Comment(req.body);
    newComment.author = user;
    await newComment.save();
    user.comments.push(newComment);
    await user.save();
    res.redirect(`/users/${userID}`);
}))

app.get('/users/:userID/comments/:commentID', wrapHandler(async (req, res) => {
    const {commentID} = req.params;
    const comment = await Comment.findById(commentID).populate('author');
    if(!comment) {
        throw new AppError('Comment not found', 404);
    }
    res.render('comments/show', {comment});
}))

app.get('/users/:userID/comments/:commentID/edit', wrapHandler(async (req, res) => {
    const {commentID} = req.params;
    const comment = await Comment.findById(commentID).populate('author');
    if(!comment) {
        throw new AppError('Comment not found', 404);
    }
    res.render('comments/edit', {comment});
}))

app.patch('/users/:userID/comments/:commentID', wrapHandler(async (req, res) => {
    const {userID, commentID} = req.params;
    await Comment.findByIdAndUpdate(commentID, req.body, {runValidators: true, new: true});
    res.redirect(`/users/${userID}/comments/${commentID}`);
}))

// TODO: DELETE /users/:userID/comments/:commentID
app.delete('/users/:userID/comments/:commentID', wrapHandler(async (req, res) => {
    const {userID, commentID} = req.params;
    await Comment.findByIdAndDelete(commentID);
    await User.findByIdAndUpdate(userID, {$pull: {comments: commentID}});
    res.redirect(`/users/${userID}`);
}))

// Comment Routes

app.get("/comments", wrapHandler(async (req, res) => {
    const comments = await Comment.find().populate('author');
    res.render("comments/index", {comments});
}))

// app.delete("/comments/:id", wrapHandler(async (req, res) => {
//     const {id} = req.params;
//     await Comment.findByIdAndDelete(id);
//     res.redirect("/comments");
// }))

app.use((err, req, res, next) => {
    const {message = 'Something went wrong...', status = 500} = err;
    res.render('error', {message, status});
})

// app.use((req, res) => {
//     res.render("error", {message: 'Page not found', status: 404});
// })