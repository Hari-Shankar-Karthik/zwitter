const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require('mongoose');

const Comment = require('./models/Comment');

const AppError = require('./errors/AppError');
const wrapHandler = require('./errors/wrapHandler');

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

app.get("/comments", wrapHandler(async (req, res) => {
    const comments = await Comment.find();
    res.render("index", {comments});
}))

app.get("/comments/new", (req, res) => {
    res.render("new");
})

app.post("/comments", wrapHandler(async (req, res) => {
    const newComment = new Comment(req.body);
    await newComment.save();
    res.redirect("/comments");
}))

app.get("/comments/:id", wrapHandler(async (req, res) => {
    const {id} = req.params;
    const comment = await Comment.findById(id);
    if(!comment) {
        throw new AppError('Comment not found', 404);
    }
    res.render('show', {comment});
}))

app.get("/comments/:id/edit", wrapHandler(async (req, res) => {
    const {id} = req.params;
    const comment = await Comment.findById(id);
    if(!comment) {
        throw new AppError('Comment not found', 404);
    }
    res.render('edit', {comment});
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