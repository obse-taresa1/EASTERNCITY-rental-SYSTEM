const express = require("express");
const controller = require("../controllers/booking.controller");
const auth = require("../middleware/auth");
const { validateCreateBooking } = require("../validators/booking.validator");

const router = express.Router();

router.use(auth);

router.get("/", controller.getMyBookings);
router.post("/", validateCreateBooking, controller.createBooking);
router.patch("/:id/accept", controller.acceptBooking);
router.patch("/:id/reject", controller.rejectBooking);

module.exports = router;
