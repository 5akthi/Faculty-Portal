const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/nodemailer')
const Faculty = require('../models/faculty')

const keys = require('../config/key')

//File Handler
const bufferConversion = require('../utils/bufferConversion')
const cloudinary = require('../utils/cloudinary')

const validateFacultyLoginInput = require('../validation/facultyLogin')
const validateFacultyUpdatePassword = require('../validation/FacultyUpdatePassword')
const validateForgotPassword = require('../validation/forgotPassword')
const validateOTP = require('../validation/otpValidation')

module.exports = {
    facultyLogin: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFacultyLoginInput(req.body);
            // Check Validation
            if (!isValid) {
              return res.status(400).json(errors);
            }
            const { email, password } = req.body;

            const faculty = await Faculty.findOne({ email })
            if (!faculty) {
                errors.email = 'Faculty does not exist';
                return res.status(404).json(errors);
            }
            const isCorrect = await bcrypt.compare(password, faculty.password)
            if (!isCorrect) {
                errors.password = 'Invalid Credentials';
                return res.status(404).json(errors);
            }
            const payload = {
                id: faculty.id, faculty
            };
            jwt.sign(
                payload,
                keys.secretOrKey,
                { expiresIn: 3600 },
                (err, token) => {
                    res.json({
                        success: true,
                        token: 'Bearer ' + token
                    });
                }
            );
        }
        catch (err) {
            console.log("Error in faculty login", err.message)
        }
    },
    updatePassword: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFacultyUpdatePassword(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { email, oldPassword, newPassword, confirmNewPassword } = req.body
            if (newPassword !== confirmNewPassword) {
                errors.confirmNewPassword = 'Password Mismatch'
                return res.status(404).json(errors);
            }
            const faculty = await Faculty.findOne({ email });
            const isCorrect = await bcrypt.compare(oldPassword, faculty.password)
            if (!isCorrect) {
                errors.oldPassword = 'Invalid old Password';
                return res.status(404).json(errors);
            }
            let hashedPassword;
            hashedPassword = await bcrypt.hash(newPassword, 10)
            faculty.password = hashedPassword;
            await faculty.save();
            res.status(200).json({ message: "Password Updated" });
        }
        catch (err) {
            console.log("Error in updating password", err.message);
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const { errors, isValid } = validateForgotPassword(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { email } = req.body
            const faculty = await Faculty.findOne({ email })
            if (!faculty) {
                errors.email = "Email not found, Provide registered email"
                return res.status(400).json(errors)
            }
            function generateOTP() {
                var digits = '0123456789';
                let OTP = '';
                for (let i = 0; i < 6; i++) {
                    OTP += digits[Math.floor(Math.random() * 10)];
                }
                return OTP;
            }
            const OTP = await generateOTP()
            faculty.otp = OTP
            await faculty.save()
            await sendEmail(faculty.email, OTP, "OTP")
            res.status(200).json({ message: "check your registered email for OTP" })
            const helper = async () => {
                faculty.otp = ""
                await faculty.save()
            }
            setTimeout(function () {
                helper()
            }, 300000);
        }
        catch (err) {
            console.log("Error in sending email", err.message)
        }
    },
    postOTP: async (req, res, next) => {
        try {
            const { errors, isValid } = validateOTP(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { email, otp, newPassword, confirmNewPassword } = req.body
            if (newPassword !== confirmNewPassword) {
                errors.confirmNewPassword = 'Password Mismatch'
                return res.status(400).json(errors);
            }
            const faculty = await Faculty.findOne({ email });
            if (faculty.otp !== otp) {
                errors.otp = "Invalid OTP, check your email again"
                return res.status(400).json(errors)
            }
            let hashedPassword;
            hashedPassword = await bcrypt.hash(newPassword, 10)
            faculty.password = hashedPassword;
            await faculty.save()
            return res.status(200).json({ message: "Password Changed" })
        }
        catch (err) {
            console.log("Error in submitting otp", err.message)
            return res.status(200)
        }

    },
    updateProfile: async (req, res, next) => {
        try {
            const { email, gender, facultyMobileNumber,
                aadharCard, designation, department } = req.body
            const userPostImg = await bufferConversion(req.file.originalname, req.file.buffer)
            const imgResponse = await cloudinary.uploader.upload(userPostImg)
            const faculty = await Faculty.findOne({ email })
            if (gender) {
                faculty.gender = gender;
                await faculty.save();
            }
            if (facultyMobileNumber) {
                faculty.facultyMobileNumber = facultyMobileNumber;
                await faculty.save();
            }
            if (aadharCard) {
                faculty.aadharCard = aadharCard;
                await faculty.save();
            }
            if (designation) {
                faculty.designation = designation;
                await faculty.save();
            }
            if (department) {
                faculty.department = department;
                await faculty.save();
            }
            faculty.avatar = imgResponse.secure_url;
            await faculty.save();
            res.status(200).json(faculty);
        }
        catch (err) {
            console.log("Error in updating Profile", err.message)
        }
    }
}