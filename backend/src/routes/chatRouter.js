const express = require('express');
const chatController = require('../controllers/ChatController');
const ioMiddleware = require('../middlewares/ioMiddleware');
const chatValidations = require('../validations/chatValidations');

const chatRouter = (io) => {
  const router = express.Router();

  router.get(
    '/messages',
    chatValidations.getMessages,
    chatController.getMessages
  );
  router.post(
    '/message',
    chatValidations.sendMessage,
    ioMiddleware(io),
    chatController.sendMessage
  );
  router.post(
    '/group-chat',
    chatValidations.createGroupChat,
    ioMiddleware(io),
    chatController.createGroupChat
  );
  router.get('/group-chat', chatController.getGroupChats);
  router.get(
    '/group-chat/messages/:groupChatId',
    chatValidations.getMessagesOfGroupChat,
    chatController.getMessagesOfGroupChat
  );
  router.post(
    '/group-chat/message',
    chatValidations.sendGroupChatMessage,
    ioMiddleware(io),
    chatController.sendGroupChatMessage
  );

  return router;
};

module.exports = chatRouter;
