const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wiki");

const articleSchema = {
    title: String,
    content: String
};

const Article = mongoose.model("Article", articleSchema);

app.route("/articles")
    .get(async (req, res) => {
        try {
            const foundArticles = await Article.find();
            res.send(foundArticles);
        } catch (err) {
            res.status(500).send(err);
        }
    })
    .post(async (req, res) => {
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });
        try {
            const savedArticle = await newArticle.save();
            res.send(savedArticle);
        } catch (err) {
            res.status(500).send(err);
        }
    })
    .delete(async (req, res) => {
        try {
            await Article.deleteMany();
            res.send("Successfully deleted all articles");
        } catch (err) {
            res.status(500).send(err);
        }
    });

app.route("/articles/:articleTitle")
    .get(async (req, res) => {
        try {
            const foundArticle = await Article.findOne({ title: req.params.articleTitle });
            if (foundArticle) {
                res.send(foundArticle);
            } else {
                res.status(404).send("No article matching that title was found.");
            }
        } catch (err) {
            res.status(500).send(err);
        }
    })
    .put(async (req, res) => {
        try {
            const updatedArticle = await Article.updateOne(
                { title: req.params.articleTitle },
                { title: req.body.title, content: req.body.content },
                { overwrite: true }
            );
            if (updatedArticle.modifiedCount > 0) {
                res.send("Successfully updated the article.");
            } else {
                res.status(404).send("No articles found with that title.");
            }
        } catch (err) {
            res.status(500).send(err);
        }
    })
    .patch(async (req, res) => {
        try {
            const updatedArticle = await Article.updateOne(
                { title: req.params.articleTitle },
                { $set: req.body }
            );
            if (updatedArticle.modifiedCount > 0) {
                res.send("Successfully updated the article.");
            } else {
                res.status(404).send("No articles found with that title.");
            }
        } catch (err) {
            res.status(500).send(err);
        }
    })
    .delete(async (req, res) => {
        try {
            const deletedArticle = await Article.deleteOne({ title: req.params.articleTitle });
            if (deletedArticle.deletedCount > 0) {
                res.send("Successfully deleted the article.");
            } else {
                res.status(404).send("No articles found with that title.");
            }
        } catch (err) {
            res.status(500).send(err);
        }
    });

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
