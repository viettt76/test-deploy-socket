const { AppDataSource } = require('../data-source');
const { Message } = require('../entity/Message');
const { Relationship } = require('../entity/Relationship');
const { GroupChat } = require('../entity/GroupChat');
const { GroupMember } = require('../entity/GroupMember');
const { User } = require('../entity/User');

const relationshipRepository = AppDataSource.getRepository(Relationship);
const messageRepository = AppDataSource.getRepository(Message);
const groupChatRepository = AppDataSource.getRepository(GroupChat);
const groupMemberRepository = AppDataSource.getRepository(GroupMember);

class ChatController {
  // [GET] /chat/messages?friendId=
  async getMessages(req, res, next) {
    const { id } = req.userToken;
    const { friendId } = req.query;
    const messages = await messageRepository
      .createQueryBuilder('message')
      .select([
        'message.id as id',
        'message.sender as sender',
        'message.receiver as receiver',
        'message.message as message',
      ])
      .where(
        `(sender = :id AND receiver = :friendId) OR (sender = :friendId AND receiver = :id)`
      )
      .setParameters({ id, friendId })
      .orderBy('message.createdAt')
      .getRawMany();

    res.status(200).json(messages);
  }

  // [POST] /chat/message
  async sendMessage(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { friendId, message } = req.body;
    const newMessage = await messageRepository.save({
      sender: id,
      receiver: friendId,
      message: message,
    });

    io.to(`user-${friendId}`).emit('newMessage', newMessage);

    res.status(201).json({
      id: newMessage.id,
    });
  }

  // [POST] /chat/group-chat
  async createGroupChat(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { name, avatar, members } = req.body;

    const newGroupChat = await groupChatRepository.save({
      name: name,
      avatar: avatar,
      administratorId: id,
    });

    await groupMemberRepository.save({
      groupChatId: newGroupChat.id,
      memberId: id,
    });

    members.forEach(async (memberId) => {
      await groupMemberRepository.save({
        groupChatId: newGroupChat.id,
        memberId: memberId,
      });
    });

    res.status(201).json();
  }

  // [GET] /chat/group-chat
  async getGroupChats(req, res, next) {
    const { id } = req.userToken;

    const groupChats = await groupChatRepository
      .createQueryBuilder('gc')
      .select([
        'gc.id as id',
        'gc.name as name',
        'gc.avatar as avatar',
        'gc.administratorId as administratorId',
      ])
      .leftJoin(GroupMember, 'gm', 'gm.groupChatId = gc.id')
      .where('gm.memberId = :id', { id })
      .getRawMany();

    res.status(200).json(groupChats);
  }

  // [GET] /chat/group-chat/messages/:groupChatId
  async getMessagesOfGroupChat(req, res, next) {
    const { groupChatId } = req.params;

    const messages = await messageRepository
      .createQueryBuilder('message')
      .leftJoin(User, 'sender', 'sender.id = message.sender')
      .select([
        'message.id as id',
        'message.sender as sender',
        'message.message as message',
        'sender.id as senderId',
        'sender.firstName as senderFirstName',
        'sender.lastName as senderLastName',
        'sender.avatar as senderAvatar',
      ])
      .where('recipientGroup = :groupChatId', { groupChatId })
      .orderBy('message.createdAt')
      .getRawMany();

    res.status(200).json(messages);
  }

  // [POST] /chat/group-chat/message
  async sendGroupChatMessage(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;

    const { groupChatId, message, picture } = req.body;

    const newMessage = await messageRepository.save({
      sender: id,
      recipientGroup: groupChatId,
      message,
      picture,
    });

    const newGroupChatMessage = await messageRepository
      .createQueryBuilder('message')
      .leftJoin(User, 'sender', 'sender.id = message.sender')
      .select([
        'message.id as id',
        'message.sender as sender',
        'message.message as message',
        'sender.id as senderId',
        'sender.firstName as senderFirstName',
        'sender.lastName as senderLastName',
        'sender.avatar as senderAvatar',
      ])
      .where('message.id = :id', { id: newMessage.id })
      .getRawOne();

    io.to(`group-chat-${groupChatId}`)
      .except(`user-${id}`)
      .emit('newGroupChatMessage', newGroupChatMessage);

    res.status(201).json();
  }
}

module.exports = new ChatController();
