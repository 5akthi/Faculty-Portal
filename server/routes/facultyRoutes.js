const express = require('express')
const passport = require('passport')
const upload = require('../utils/multer')

const router = express.Router()

const { facultyLogin, updatePassword, forgotPassword, postOTP, updateProfile } = require('../controller/facultyController')

router.post('/login', facultyLogin)

router.post('/forgotPassword', forgotPassword)

router.post('/postOTP', postOTP)

router.post('/updateProfile', passport.authenticate('jwt', { session: false }), upload.single("avatar") ,updateProfile)

router.post('/updatePassword', passport.authenticate('jwt', { session: false }), updatePassword)


module.exports = router