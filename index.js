const path = require("path");
const express = require("express");
const methodOverride = require("method-override");
const {v4: uuidv4} = require("uuid");
const ejs = require("ejs");
const app = express();
const allComments = [
    { 
        id: uuidv4(),
        username: 'Harry Clifton', 
        comment: "This song gives me chills every time I listen to it! 😍" 
    },
    { 
        id: uuidv4(),
        username: 'Emma Barrington', 
        comment: "I'm supposed to be studying, but here I am, watching this instead. Worth it!" 
    },
    { 
        id: uuidv4(),
        username: 'Giles Barrington', 
        comment: "Can't wait to see this movie! The trailer looks epic!" 
    },
    { 
        id: uuidv4(),
        username: 'Sebastian Clifton', 
        comment: "I tried making this recipe, and it turned out delicious! Thanks for sharing!" 
    },
    { 
        id: uuidv4(),
        username: 'Maisie Clifton', 
        comment: "I followed this workout routine for a week, and I can already see results. Highly recommend!" 
    },
    { 
        id: uuidv4(),
        username: 'Hugo Barrington', 
        comment: "Adding this destination to my bucket list! Looks breathtaking 😍" 
    },
    { 
        id: uuidv4(),
        username: 'Jessica Clifton', 
        comment: "I never knew I needed this DIY project until now. Time to get crafting!" 
    },
    { 
        id: uuidv4(),
        username: 'Grace Barrington', 
        comment: "My cat was mesmerized by this video! 😺"
    }
]; // pretend this came from a database

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