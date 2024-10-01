const authRouter = require('./authRouter');
const postRouter = require('./postRouter');
const relationshipRouter = require('./relationshipRouter');
const chatRouter = require('./chatRouter');
const userRouter = require('./userRouter');
const authMiddleware = require('../middlewares/authMiddleware');

const routes = (app, io) => {
  app.use('/api/auth', authMiddleware, authRouter);
  app.use('/api/posts', authMiddleware, postRouter(io));
  app.use('/api/relationships', authMiddleware, relationshipRouter(io));
  app.use('/api/chat', authMiddleware, chatRouter(io));
  app.use('/api/user', authMiddleware, userRouter(io));
};

module.exports = routes;
