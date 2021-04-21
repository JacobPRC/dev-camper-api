const express = require("express");
const {
  getAllBootcamps,
  getBootcampById,
  createBootcamp,
  editBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

// Include other resource routers
const courseRouter = require("./course");

const router = express.Router();

// Reroute into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/:id/photo").put(uploadBootcampPhoto);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getAllBootcamps)
  .post(createBootcamp);

router
  .route("/:id")
  .get(getBootcampById)
  .put(editBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
