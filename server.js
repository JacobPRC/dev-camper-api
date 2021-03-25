const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");

const connectDB = require("./config/db");
const bootcamps = require("./routes/bootcamp");
const courses = require("./routes/course");
const errHandler = require("./middleware/error");

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();

app.use(express.json());

// dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
console.log(process.env.NODE_ENV);

//Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

// Set up error handler middleware to use in routers
app.use(errHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Listening on ${PORT}`.yellow.bold)
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, rejection) => {
  console.log(`Error: ${err.message}`.red);

  //Close server and exit process
  server.close(() => process.exit(1));
});
