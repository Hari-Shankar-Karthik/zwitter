const path = require("path");
const express = require("express");
const methodOverride = require("method-override");
const ejs = require("ejs");
const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static("public"));

const portNum = 8080;
app.listen(portNum, () => {
    console.log(`Listening on port ${portNum}`);
})

app.get("/comments", (req, res) => {
    res.render("index", {comments: allComments});
})

app.get("/comments/new", (req, res) => {
    res.render("new");
})

app.post("/comments", (req, res) => {
    const {username, comment} = req.body;
    allComments.push({username, comment, id: uuidv4()});
    res.redirect("/comments");
})

const getComment = id => allComments.find(comment => comment.id === id);

const renderSpecificComment = (req, res, route, fallbackRoute = "error-404") => {
    const comment = getComment(req.params.id);
    if(comment) {
        res.render(route, {...comment});
    } else {
        res.render(fallbackRoute);
    }
}

app.get("/comments/:id", (req, res) => {
    renderSpecificComment(req, res, "show");
})

app.get("/comments/:id/edit", (req, res) => {
    renderSpecificComment(req, res, "edit");
})

const getIndex = id => allComments.findIndex(comment => comment.id === id);

app.patch("/comments/:id", (req, res) => {
    const {id} = req.params;
    const index = getIndex(id);
    if(index >= 0) {
        const {comment} = req.body;
        allComments[index].comment = comment;
    }
    res.redirect(`/comments/${id}`);
})

app.delete("/comments/:id", (req, res) => {
    const index = getIndex(req.params.id);
    if(index >= 0) {
        allComments.splice(index, 1);
    }
    res.redirect("/comments");
})


app.get("*", (req, res) => {
    res.render("error-404");
})