require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const valid = require("valid-url");
const mongoose = require("mongoose");
const bp = require("body-parser");
const sid = require("shortid");
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

// Basic Configuration
const port = process.env.PORT || 4000;
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
const Counter = mongoose.model("Counter", new Schema({
  count: Number
}));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:short', function (req, res) {
  Urls.find({ short_url: req.params.short }).then(function (docs) {
    res.redirect(docs[0].original_url);
  });
});

app.post("/api/shorturl", async function (req, res) {
  const url = valid.isWebUri(req.body.url);
  if (url != undefined) {
    let id = sid.generate();

    let newUrl = new Urls({
      original_url: url,
      short_url: id,
    });
    const update = await newUrl.save();
    res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url
    });

  }
  else {
    res.json({ "error": "invalid URL" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
