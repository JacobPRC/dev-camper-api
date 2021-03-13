const express = require("express");
const {
  getAllBootcamps,
  getBootcampById,
  createBootcamp,
  editBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
} = require("../controllers/bootcamps");

const router = express.Router();

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/").get(getAllBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcampById)
  .put(editBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
