const service = require("../services/booking.service");

async function createBooking(req, res, next) {
  try {
    const data = await service.createBooking(req.user, req.body);
    res
      .status(201)
      .json({ success: true, message: "Booking request created.", data });
  } catch (error) {
    next(error);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const data = await service.getMyBookings(req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function acceptBooking(req, res, next) {
  try {
    const data = await service.acceptBooking(req.user, req.params.id);
    res.json({ success: true, message: "Booking accepted.", data });
  } catch (error) {
    next(error);
  }
}

async function rejectBooking(req, res, next) {
  try {
    const data = await service.rejectBooking(
      req.user,
      req.params.id,
      req.body.reason,
    );
    res.json({ success: true, message: "Booking rejected.", data });
  } catch (error) {
    next(error);
  }
}

module.exports = { createBooking, getMyBookings, acceptBooking, rejectBooking };
