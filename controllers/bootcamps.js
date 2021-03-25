const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Geocoder = require("../utils/geocoder");

// @desc  -  Get all bootcamps
// @route  -  GET /api/v1/bootcamps
// @access  -  Public
exports.getAllBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const fieldsRemoved = ["select", "sort", "page", "limit"];

  // Loop over fieldsRemoved & delete from reqQuery
  fieldsRemoved.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators (ie $gt, $gte...)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  query = Bootcamp.find(JSON.parse(queryStr));

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort Fields
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Paginate Fields
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalDocs = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const bootcamps = await query;

  // Pagination Results
  const pagination = {};

  if (endIndex < totalDocs) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

// @desc  -  Get single bootcamp
// @route  -  GET /api/v1/bootcamps/:id
// @access  -  Public
exports.getBootcampById = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp ID: ${req.params.id} not found.`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc  -  create new bootcamp
// @route  -  POST /api/v1/bootcamps
// @access  -  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const newBootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: newBootcamp });
});

// @desc  -  Edit bootcamp
// @route  -  PUT /api/v1/bootcamps/:id
// @access  -  Private
exports.editBootcamp = asyncHandler(async (req, res, next) => {
  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedBootcamp) {
    return next(
      new ErrorResponse(`Bootcamp ID: ${req.params.id} not found.`, 404)
    );
  }
});

// @desc  -  Delete bootcamp
// @route  -  DELETE /api/v1/bootcamps/:id
// @access  -  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp ID: ${req.params.id} not found.`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc  -  Get bootcamps w/in a radius
// @route  -  DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access  -  Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // GET lat/long from geocoder
  const loc = await Geocoder.geocode(zipcode);
  console.log(loc[0].latitude);
  const lat = loc[0].latitude;
  const long = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth radius === 3,963 mi
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
