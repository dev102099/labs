const express = require("express");
const docRouter = require("./routes/document.route");
const app = express();
const cors = require("cors");
const port = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/documents", docRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
