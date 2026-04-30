const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validateRequest = require('../middlewares/validateMiddleware');
const { createUserSchema } = require('../utils/validators');
const { listUsers, getUser, createUserHandler } = require('../controllers/userController');

const router = express.Router();

router.get('/', asyncHandler(listUsers));
router.get('/:id', asyncHandler(getUser));
router.post('/', validateRequest(createUserSchema), asyncHandler(createUserHandler));

module.exports = router;
