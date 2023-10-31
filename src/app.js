const path = require('path');
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDb = require('./config/connectDb');

const swagger = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

require('dotenv').config();

const authRouter = require('./modules/auth/auth.routes');
const usersRouter = require('./modules/users/user.routes');
const reviewsRouter = require('./modules/reviews/review.routes');
const tasksRouter = require('./modules/tasks/task.routes');

const app = express();
const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app
  .use(logger(formatsLogger))
  .use(cors())
  .use(express.json())
  .use(cookieParser())
  .use(express.urlencoded({ extended: false }))
  .use(express.static(path.join(__dirname, '..', 'public')));

app
  .use('/api/auth', authRouter)
  .use('/api/users', usersRouter)
  .use('/api/reviews', reviewsRouter)
  .use('/api/tasks', tasksRouter);

app.use('/api/docs', swagger.serve, swagger.setup(swaggerDocument));

app.use((req, res) => {
  res.status(404).json({ code: 404, message: 'Rout not found' });
});

app.use((err, req, res, next) => {
  const { status = 500, message = 'Server erorr' } = err;
  res.status(status).json({ code: status, message: message });
});

connectDb();
const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`✅Server running on port ${PORT}`);
});
