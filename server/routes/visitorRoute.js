const express = require('express');
const router = express.Router();
const { fetchFaculties, registerFaculty } = require('../controller/visitorController');

router.get('/faculties', fetchFaculties);

router.post('/register', registerFaculty);

module.exports = router;