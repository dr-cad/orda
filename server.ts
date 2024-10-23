import bodyParser from "body-parser";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json()); // for parsing application/json

app.get("/", (req, res) => {
  res.send("Hello dear!");
});

app.post("/process", (req, res) => {
  console.log(req.body);
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
