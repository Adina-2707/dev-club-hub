require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');
const errorHandler = require('./middlewares/errorMiddleware');
const AppError = require('./errors/AppError');
const { successResponse } = require('./utils/response');

const app = express();
const port = process.env.PORT || 3001;
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('combined'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/health', (req, res) => {
  res.json(successResponse({ status: 'ok', timestamp: new Date().toISOString() }));
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);

app.use((req, res, next) => {
  next(new AppError('Not Found', 404));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Dev Club API listening on port ${port}`);
});
