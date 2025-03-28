const express = require("express");
const router  = express.Router();
const {hospitalForm, hospitalInfo} = require("../controllers/hospital-controller");

router.route("/formHospitalDetail").post(hospitalForm);
router.route("/fetchHostitalInfo").get(hospitalInfo);

module.exports = router;