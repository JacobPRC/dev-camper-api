const dotenv = require("dotenv");
const path = require("path");

const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Geocoder = require("../utils/geocoder");

// @desc  -  Get all bootcamps
// @route  -  GET /api/v1/bootcamps
// @access  -  Public
exports.getAllBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp ID: ${req.params.id} not found.`, 404)
    );
  }

  bootcamp.remove();

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

// @desc  -  Upload photo
// @route  -  PUT /api/v1/bootcamps/:id/photo
// @access  -  Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp ID: ${req.params.id} not found.`, 404)
    );
  }

  if (!req.files) return next(new ErrorResponse(`Please upload a photo`, 400));

  const { file } = req.files;

  // Make sure img if a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload a photo`, 400));
  }
  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
        400
      )
    );
  }

  // Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with upload`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
