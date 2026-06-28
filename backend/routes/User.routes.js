const express = require("express");
const router  = express.Router();

const { getMe, updateMe, changePassword, updateFcmToken, deleteMe } = require("../controllers/User.controller");
const { updateProfileValidator, changePasswordValidator }           = require("../validation/userValidation");
const validate        = require("../middelwares/validationMW");
const { protect }     = require("../middelwares/Auth.middleware");

router.use(protect);

router.get("/me",           getMe);
router.put("/me",           [...updateProfileValidator,  validate], updateMe);
router.put("/me/password",  [...changePasswordValidator, validate], changePassword);
router.put("/me/fcm-token", updateFcmToken);
router.delete("/me",        deleteMe);

module.exports = router;