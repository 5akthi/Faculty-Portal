const mongoose = require('mongoose')
const { Schema } = mongoose


const facultySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    designation: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    department: {
        type: String, 
        required: true
    },
    facultyMobileNumber: {
        type: Number
    },
    gender: {
        type: String,
    },
    avatar: {
        type: String
    },
    dob: {
        type: String,
        required: true
    },
    experience: [
        {
          title: {
            type: String,
            required: true
          },
          company: {
            type: String,
            required: true
          },
          location: {
            type: String
          },
          from: {
            type: Date,
            required: true
          },
          to: {
            type: Date
          },
          current: {
            type: Boolean,
            default: false
          },
          description: {
            type: String
          }
        }
      ],
      education: [
        {
          school: {
            type: String,
            required: true
          },
          degree: {
            type: String,
            required: true
          },
          fieldofstudy: {
            type: String,
            required: true
          },
          from: {
            type: Date,
            required: true
          },
          to: {
            type: Date
          },
          current: {
            type: Boolean,
            default: false
          },
          description: {
            type: String
          }
        }
      ],
    publications:{
        type: [String]
    },
    seminars:{
        type: [String]
    },
    specialization:{
        type: [String]
    },
    date: {
        type: Date,
        default: Date.now
    },
    otp: {
        type: String
    }
})


module.exports = mongoose.model('faculty', facultySchema)