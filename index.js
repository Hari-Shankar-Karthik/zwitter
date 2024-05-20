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
    const user = await User.findById(userID);
    if(!user) {
        throw new AppError('User not found', 404);
    }
    res.render('users/show', {user});
}))

app.delete('/users/:userID', wrapHandler(async (req, res) => {
    const {userID} = req.params;
    await User.findByIdAndDelete(userID);
    // TODO: Delete all comments associated with this user
    res.redirect('/users');
}))

// Comment Routes:

app.get("/comments", wrapHandler(async (req, res) => {
    const comments = await Comment.find();
    res.render("comments/index", {comments});
}))

app.get("/comments/new", (req, res) => {
    res.render("comments/new");
})

app.post("/comments", wrapHandler(async (req, res) => {
    const newComment = new Comment(req.body);
    await newComment.save();
    res.redirect(`/comments/${newComment._id}`);
}))

app.get("/comments/:id", wrapHandler(async (req, res) => {
    const {id} = req.params;
    const comment = await Comment.findById(id);
    if(!comment) {
        throw new AppError('Comment not found', 404);
    }
    res.render('comments/show', {comment});
}))

app.get("/comments/:id/edit", wrapHandler(async (req, res) => {
    const {id} = req.params;
    const comment = await Comment.findById(id);
    if(!comment) {
        throw new AppError('Comment not found', 404);
    }
    res.render('comments/edit', {comment});
}))

app.patch("/comments/:id", wrapHandler(async (req, res) => {
    const {id} = req.params;
    const updatedComment = await Comment.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
    res.redirect(`/comments/${id}`);
}))

app.delete("/comments/:id", wrapHandler(async (req, res) => {
    const {id} = req.params;
    await Comment.findByIdAndDelete(id);
    res.redirect("/comments");
}))

app.use((err, req, res, next) => {
    const {message = 'Something went wrong...', status = 500} = err;
    res.render('error', {message, status});
})

app.use((req, res) => {
    res.render("error", {message: 'Page not found', status: 404});
})