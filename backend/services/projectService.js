const { query } = require('../db');

const getAllProjects = async () => {
  const result = await query(
    `SELECT p.id, p.title, p.description, p.github_link, p.owner_id, u.name AS owner_name, p.created_at
     FROM projects p
     JOIN users u ON p.owner_id = u.id
     ORDER BY p.created_at DESC`,
  );
  return result.rows;
};

const getProjectById = async (id) => {
  const result = await query(
    `SELECT p.id, p.title, p.description, p.github_link, p.owner_id, u.name AS owner_name, p.created_at
     FROM projects p
     JOIN users u ON p.owner_id = u.id
     WHERE p.id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

const createProject = async ({ title, description, github_link, owner_id }) => {
  const result = await query(
    `INSERT INTO projects (title, description, github_link, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, github_link, owner_id, created_at`,
    [title, description, github_link, owner_id],
  );
  return result.rows[0];
};

const updateProject = async (id, { title, description, github_link }) => {
  const result = await query(
    `UPDATE projects
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         github_link = COALESCE($3, github_link)
     WHERE id = $4
     RETURNING id, title, description, github_link, owner_id, created_at`,
    [title, description, github_link, id],
  );
  return result.rows[0] || null;
};

const deleteProject = async (id) => {
  const result = await query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
