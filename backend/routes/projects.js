const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');
const { createProjectSchema, updateProjectSchema } = require('../utils/validators');
const {
  listProjects,
  getProject,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
} = require('../controllers/projectController');

const router = express.Router();

router.get('/', asyncHandler(listProjects));
router.get('/:id', asyncHandler(getProject));
router.post('/', authMiddleware, validateRequest(createProjectSchema), asyncHandler(createProjectHandler));
router.put('/:id', authMiddleware, validateRequest(updateProjectSchema), asyncHandler(updateProjectHandler));
router.delete('/:id', authMiddleware, asyncHandler(deleteProjectHandler));

module.exports = router;
