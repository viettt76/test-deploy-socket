import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './ChatGroupPopup.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import * as actions from '~/redux/actions';
import { getMessagesOfGroupChatService, sendGroupChatMessageService } from '~/services/chatServices';
import socket from '~/socket';
import _ from 'lodash';
import useClickOutside from '~/hook/useClickOutside';

const ChatPopupGroup = ({ group }) => {
    const { ref: chatPopupRef, isComponentVisible: isFocus, setIsComponentVisible: setIsFocus } = useClickOutside(true);
    const userInfo = useSelector(userInfoSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        socket.emit('joinGroupChat', group?.id);
    }, [group?.id]);

    useEffect(() => {
        const handleNewGroupChatMessage = (newGroupChatMessage) => {
            setMessages((prev) => [...prev, newGroupChatMessage]);
        };
        socket.on('newGroupChatMessage', handleNewGroupChatMessage);

        return () => {
            socket.off('newGroupChatMessage', handleNewGroupChatMessage);
        };
    }, [userInfo?.id]);

    const endOfMessagesRef = useRef(null);

    const [messages, setMessages] = useState([]);

    const [sendMessage, setSendMessage] = useState('');
    const [processingMessage, setProcessingMessage] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (group?.id) {
                    const res = await getMessagesOfGroupChatService(group?.id);
                    setMessages(res);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchMessages();
    }, [group]);

    useEffect(() => {
        endOfMessagesRef.current.scrollTop = endOfMessagesRef.current.scrollHeight;
    }, [messages]);

    const handleCloseChatPopup = useCallback(() => {
        dispatch(actions.closeChat(group?.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group?.id]);

    const handleSendMessage = async () => {
        try {
            setMessages((prev) => [
                ...prev,
                {
                    id: null,
                    sender: userInfo?.id,
                    message: sendMessage,
                },
            ]);
            const clone = sendMessage;
            setSendMessage('');
            setProcessingMessage('Đang xử lý');

            const res = await sendGroupChatMessageService({ groupChatId: group?.id, message: clone });
            setMessages((prev) => {
                const index = _.findIndex(prev, { id: null, message: clone });

                if (index === -1) return prev;

                const updatedMessages = _.cloneDeep(prev);
                updatedMessages[index] = { ...updatedMessages[index], id: res?.id };

                return updatedMessages;
            });

            setProcessingMessage('');
        } catch (error) {
            console.log(error);
            setProcessingMessage('Lỗi');
        }
    };

    useEffect(() => {
        window.onkeydown = (e) => {
            if (isFocus && e.key === 'Escape') {
                handleCloseChatPopup();
            }
        };
    }, [handleCloseChatPopup, isFocus]);

    return (
        <div className={clsx(styles['chat-wrapper'])} ref={chatPopupRef} onClick={() => setIsFocus(true)}>
            <div
                className={clsx(styles['chat-header'], {
                    [[styles['is-focus']]]: isFocus,
                })}
            >
                <div className={clsx(styles['chat-receiver'])}>
                    <div className={clsx(styles['avatar'])}>
                        <img src={group?.avatar || defaultAvatar} />
                    </div>
                    {group?.name && <div className={clsx(styles['name'])}>{`${group?.name}`}</div>}
                </div>
                <FontAwesomeIcon
                    icon={faXmark}
                    className={clsx(styles['chat-close'])}
                    onClick={() => handleCloseChatPopup(false)}
                />
            </div>
            <div ref={endOfMessagesRef} className={clsx(styles['chat-container'])}>
                {messages?.length > 0 ? (
                    messages?.map((message, index) => {
                        return (
                            <div
                                key={`chat-${index}`}
                                className={clsx(styles['message-wrapper'], {
                                    [[styles['message-current-user']]]: message?.sender === userInfo?.id,
                                    ['mt-3']: messages[index - 1]?.sender !== messages[index]?.sender,
                                })}
                            >
                                {messages[index - 1]?.sender !== messages[index]?.sender &&
                                    message.sender !== userInfo?.id && (
                                        <img
                                            className={clsx(styles['message-avatar'])}
                                            src={message?.senderAvatar || defaultAvatar}
                                        />
                                    )}
                                <div className={clsx(styles['message'])}>{message?.message}</div>
                                {processingMessage &&
                                    _.findLast(messages, { sender: userInfo?.id }) &&
                                    _.isEqual(_.findLast(messages, { sender: userInfo?.id }), message) && (
                                        <div className={clsx(styles['process-message'])}>{processingMessage}</div>
                                    )}
                            </div>
                        );
                    })
                ) : (
                    <div className="mt-5 text-center fz-16">Hãy bắt đầu cuộc trò chuyện với {group?.name}</div>
                )}
                <div></div>
            </div>
            <div className={clsx(styles['chat-footer'])}>
                <div className={clsx(styles['send-message-wrapper'])}>
                    <input
                        value={sendMessage}
                        className={clsx(styles['send-message'])}
                        placeholder="Aa"
                        onChange={(e) => setSendMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                    />
                    {sendMessage ? (
                        <i className={clsx(styles['send-message-btn'])} onClick={handleSendMessage}></i>
                    ) : (
                        <FontAwesomeIcon className={clsx(styles['link-icon'])} icon={faThumbsUp} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPopupGroup;
