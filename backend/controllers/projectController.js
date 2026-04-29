const { getAllProjects, getProjectById, createProject, updateProject, deleteProject } = require('../services/projectService');
const { successResponse } = require('../utils/response');
const AppError = require('../errors/AppError');

const listProjects = async (req, res) => {
  const projects = await getAllProjects();
  res.json(successResponse(projects));
};

const getProject = async (req, res, next) => {
  const { id } = req.params;
  const project = await getProjectById(id);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }
  res.json(successResponse(project));
};

const createProjectHandler = async (req, res) => {
  const { title, description, github_link } = req.body;
  const owner_id = req.user.id;
  const project = await createProject({ title, description, github_link, owner_id });
  res.status(201).json(successResponse(project));
};

const updateProjectHandler = async (req, res, next) => {
  const { id } = req.params;
  const project = await getProjectById(id);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  if (project.owner_id !== req.user.id) {
    return next(new AppError('Forbidden: only project owner can modify this project', 403));
  }

  const updated = await updateProject(id, req.body);
  res.json(successResponse(updated));
};

const deleteProjectHandler = async (req, res, next) => {
  const { id } = req.params;
  const project = await getProjectById(id);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  if (project.owner_id !== req.user.id) {
    return next(new AppError('Forbidden: only project owner can delete this project', 403));
  }

  await deleteProject(id);
  res.json(successResponse({ message: 'Project deleted successfully' }));
};

module.exports = {
  listProjects,
  getProject,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
};
