const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validateRequest = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema } = require('../utils/validators');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), asyncHandler(register));
router.post('/login', validateRequest(loginSchema), asyncHandler(login));

module.exports = router;
