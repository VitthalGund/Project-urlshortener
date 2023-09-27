require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongodb = require("valid-url");
const mongoose = require("mongoose");
const bp = require("body-parser");
const shortID = require("short-unique-id")
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to database.");
});

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
const Urls = mongoose.model("URLs", urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.post("/api/short/new", function (req, res) {
  const url = mongodb.isWebUri(req.body.url);
  if (url != undefined) {
    let id = new shortID({ length: 2 });

    let newUrl = new Urls({
      original_url: url,
      short_url: id,
    });
    newUrl.save(function (err, doc) {
      if (err) return console.error(err);
      res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url
      });
    });
  }
  else {
    res.json({ "error": "invalid URL" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
