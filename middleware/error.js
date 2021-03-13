const ErrorResponse = require("../utils/errorResponse");

const errHandler = (err, req, res, next) => {
  let error = { ...err };
  console.log(err.stack.red);

  error.message = err.message;

  //  Incorrect ID Error
  if (err.name === "CastError") {
    const message = `Resource id: ${err.value} was not found`;
    error = new ErrorResponse(message, 404);
  }

  //   Duplicate Fields Error
  if (err.code == 11000) {
    const message = `Duplicate field value(s) entered`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server error" });
};

module.exports = errHandler;
