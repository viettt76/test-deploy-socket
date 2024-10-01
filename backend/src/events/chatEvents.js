const chatEvents = (socket) => {
  socket.on('joinGroupChat', (groupChatId) => {
    socket.join(`group-chat-${groupChatId}`);
  });
};

module.exports = chatEvents;
