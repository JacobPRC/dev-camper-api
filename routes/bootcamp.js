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

const { protect, authorize } = require("../middleware/auth");

// Reroute into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), uploadBootcampPhoto);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getAllBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  .get(getBootcampById)
  .put(protect, authorize("publisher", "admin"), editBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

module.exports = router;
