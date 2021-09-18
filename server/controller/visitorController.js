const Faculty = require('../models/faculty');

module.exports = {
    fetchFaculties: async (req, res, next) => {
        try {
            const { department, designation } = req.body;
            const allFaculties = await Faculty.find({ department, course, designation });
            res.status(200).json({ result: allFaculties});
        }
        catch (err) {
            console.log("Error in gettting all faculties", err.message)
        }
    },
    registerFaculty: async (req, res, next) => {
        try {

            const { errors, isValid } = validateFacultyRegisterInput(req.body);

            //Validation
            if (!isValid) {
                return res.status(400).json(errors);
            }

            const { name, email, designation, department, facultyMobileNumber,
                aadharCard, dob, gender, publications, seminars, interests, password , education, experience } = req.body;
            const faculty = await Faculty.findOne({ email });

            if (faculty) {
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
            }

            const avatar = gravatar.url(req.body.email, {
                s: '200', // Size
                r: 'pg', // Rating
                d: 'mm' // Default
            });

            let hashedPassword;
            hashedPassword = await bcrypt.hash(password, 10);
            const newFaculty = await new Faculty({
                name,
                email,
                designation,
                password : hashedPassword,
                department,
                facultyMobileNumber,
                gender,
                avatar,
                aadharCard,
                dob,
                experience,
                education,
                publications,
                seminars,
                interests
            })
            await newFaculty.save();
            res.status(200).json({ result: newFaculty });
        }
        catch (err) {
            console.log("error", err.message);
            res.status(400).json({ message: `Error in registering", ${err.message}` })
        }

    },
}