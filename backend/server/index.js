// server/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/appointment", require("./routes/appointment"));
app.use("/api/reminder", require("./routes/reminder"));
app.use("/api/predict", require("./routes/prediction"));
app.use("/api/summarize", require("./routes/summarizer"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(5000, () => console.log("Server running on port 5000")))
  .catch(err => console.log(err));
