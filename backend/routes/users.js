const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { listUsers, getUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', asyncHandler(listUsers));
router.get('/:id', asyncHandler(getUser));

module.exports = router;
