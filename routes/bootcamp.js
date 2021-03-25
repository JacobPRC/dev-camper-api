const express = require("express");
const {
  getAllBootcamps,
  getBootcampById,
  createBootcamp,
  editBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
} = require("../controllers/bootcamps");

// Include other resource routers
const courseRouter = require("./course");

const router = express.Router();

// Reroute into other resource routers
router.use("/bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/").get(getAllBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcampById)
  .put(editBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
