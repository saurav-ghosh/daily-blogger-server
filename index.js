const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const ObjectID = require("mongodb").ObjectID;

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

app.get("/", (req, res) => {
    res.send("Database is working successfully");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@test.0kqsr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
client.connect((err) => {
    const blogCollection = client.db("blogLists").collection("blogs");

    app.post("/publishBlog", (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const desc = req.body.desc;
        const date = req.body.date;

        const newImg = file.data;
        const encImg = newImg.toString("base64");

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, "base64"),
        };
        blogCollection
            .insertOne({ title, desc, image, date })
            .then((result) => {
                res.send(result.insertedCount > 0);
            });
    });

    app.get("/blogs", (req, res) => {
        blogCollection.find({}).toArray((err, blogs) => {
            res.send(blogs);
        });
    });

    app.get("/blogDetail/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        blogCollection.find({ _id: id }).toArray((err, documents) => {
            res.send(documents[0]);
        });
    });
});

app.listen(process.env.PORT || 5050);
