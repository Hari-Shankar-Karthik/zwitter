const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const seedComments = require('./helper');

mongoose.connect('mongodb://localhost:27017/my-comments')
    .then(() => {
        console.log("Mongo connection open!");
    })
    .catch(err => {
        console.log("Mongo connection error!");
        console.log(err);
    });

const seedDB = async () => {
    await Comment.deleteMany({});
    await Comment.insertMany(seedComments);
    console.log("DB seeded!");
};

seedDB()
    .then(() => {
        mongoose.connection.close();
        console.log("Mongo connection closed!");
    })
    .catch(err => {
        console.log("Error seeding DB!");
        console.log(err);
    })