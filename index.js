const express = require("express");
const { nanoid } = require("nanoid");
const app = express();
const path = require("path");
const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const MongoClient = require('mongodb').MongoClient;
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public/views")));
app.use(express.static(path.join(__dirname, "public/css")));
app.use(express.static(path.join(__dirname, "public/js")));
app.use(express.static(path.join(__dirname, "public/images")));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  let alreadyExists = false;

  try {
    alreadyExists = await checkEntry(slug);
  } catch (error) {
  }
  if (alreadyExists) {
    res.redirect(alreadyExists.url);
  } else {
    res.send("Page not found");
  }
})


app.post("/url", async (req, res) => {
  let { url, slug } = req.body;
  if (slug) {
    const alreadyExists = await checkEntry(slug);
    if (alreadyExists) {
      res.send({ success: false, message: "Slug already in use. Please try another one!" });
    } else {
      const result = await addEntry(url, slug);
      res.send({ success: true, message: "URL has been successfully shortened.", result: { url: result.url, slug: result.slug, shortenedUrl: result.shortenedUrl } });
    }
  } else {
    slug = nanoid(6);
    const result = await addEntry(url, slug);
    res.send({ success: true, message: "URL has been successfully shortened.", result: { url: result.url, slug: result.slug, shortenedUrl: result.shortenedUrl } });
  }
  res.send(`${baseUrl}${slug}`);
});

async function addEntry(url, slug) {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017", { useUnifiedTopology: true });
    const db = await client.db("URLShortner");
    const collection = await db.collection('Urls');
    const shortenedUrl = `${baseUrl}/${slug}`;
    const result = await collection.insertOne({ url, slug, shortenedUrl });
    return result.ops[0];
  } catch (error) {
    throw error;
  }
}

async function checkEntry(slug) {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017", { useUnifiedTopology: true });
    const db = await client.db("URLShortner");
    const collection = await db.collection('Urls');
    const result = await collection.findOne({ slug });
    return result;
  } catch (error) {
    throw error;
  }
}

app.listen(port, () => {
  console.log("baseUrl", baseUrl);
  console.log("port", port);
  console.log(`Listening to port ${port}`);
});
