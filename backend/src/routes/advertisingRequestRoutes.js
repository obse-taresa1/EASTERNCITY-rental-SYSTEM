const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/uploadMiddleware");
const controller = require("../controllers/advertisingRequestController");
const { validateAdvertisingRequest, validateAdvertisingRequestUpdate } = require("../validators/advertisingRequestValidator");

const router = express.Router();
router.post("/", upload.advertisingBanner, validateAdvertisingRequest, controller.create);
router.post("/:reference/payment-status", controller.getPaymentStatus);
router.post("/:reference/payment-receipt", upload.advertisingReceipt, controller.uploadReceipt);
router.get("/", auth, authorize("ADMIN", "SUPER_ADMIN"), controller.list);
router.patch("/:id", auth, authorize("ADMIN", "SUPER_ADMIN"), validateAdvertisingRequestUpdate, controller.update);

module.exports = router;
