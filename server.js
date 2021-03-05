const express = require("express");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("HELLO WORLD"));

app.listen(PORT, () => console.log(`Listening on ${PORT} `));
