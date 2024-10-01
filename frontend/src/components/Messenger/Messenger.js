import clsx from 'clsx';
import styles from './Messenger.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMagnifyingGlass, faUsers } from '@fortawesome/free-solid-svg-icons';
import { createGroupChatService, getGroupChatsService } from '~/services/chatServices';
import { useEffect, useState } from 'react';
import socket from '~/socket';
import { useDispatch } from 'react-redux';
import * as actions from '~/redux/actions';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const Messenger = ({ messengerRef, showMessenger }) => {
    const dispatch = useDispatch();

    const [showCreateNewGroup, setShowCreateNewGroup] = useState(false);
    const handleShowCreateNewGroup = () => setShowCreateNewGroup(true);
    const handleHideCreateNewGroup = () => setShowCreateNewGroup(false);

    const [infoNewGroupChat, setInfoNewGroupChat] = useState({
        name: '',
        avatar: null,
        members: [],
    });

    const [onlineFriends, setOnlineFriends] = useState([]);

    const [groupChats, setGroupChats] = useState([]);

    useEffect(() => {
        socket.emit('getFriendsOnline');

        const handleFriendOnline = (resOnlineFriends) => {
            setOnlineFriends(resOnlineFriends);
        };
        socket.on('friendsOnline', handleFriendOnline);

        return () => {
            socket.off('friendsOnline', handleFriendOnline);
        };
    }, []);

    const handleCreateGroupChat = async () => {
        try {
            await createGroupChatService({
                name: infoNewGroupChat.name,
                avatar: infoNewGroupChat.avatar,
                members: infoNewGroupChat.members,
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchGetGroupChats = async () => {
            try {
                const res = await getGroupChatsService();
                setGroupChats(res);
            } catch (error) {
                console.log(error);
            }
        };
        fetchGetGroupChats();
    }, []);

    const addGroupToChatList = (group) => {
        dispatch(
            actions.openChat({
                ...group,
                isGroupChat: true,
            }),
        );
    };

    return (
        <div
            ref={messengerRef}
            className={clsx(styles['messenger-wrapper'], {
                [styles['showMessenger']]: showMessenger,
            })}
        >
            {!showCreateNewGroup ? (
                <div>
                    <div className={clsx('d-flex align-items-center', styles['messenger-header'])}>
                        <div className={clsx(styles['search-wrapper'])}>
                            <FontAwesomeIcon className={clsx(styles['search-icon'])} icon={faMagnifyingGlass} />
                            <input className={clsx(styles['search-input'])} placeholder="Tìm kiếm" />
                        </div>
                        <div
                            className={clsx('fz-15', styles['create-group-chat-btn-wrapper'])}
                            data-tooltip-id="tool-tip-create-group-chat"
                        >
                            <FontAwesomeIcon
                                className={clsx(styles['create-group-chat-btn'])}
                                icon={faUsers}
                                onClick={handleShowCreateNewGroup}
                            />
                            <ReactTooltip id="tool-tip-create-group-chat" place="bottom" content="Tạo nhóm" />
                        </div>
                    </div>

                    {/* <div className={clsx(styles['conversation-wrapper'])}>
                    <div className={clsx(styles['conversation'])}>
                        <img className={clsx(styles['avatar'])} src={defaultAvatar} />
                        <div>
                            <h6 className={clsx(styles['name'])}>Hoàng Việt</h6>
                            <div className={clsx(styles['last-message'])}>Không biết nữa</div>
                        </div>
                    </div>
                </div> */}

                    {groupChats?.map((groupChat) => {
                        return (
                            <div
                                key={`group-chat-${groupChat?.id}`}
                                className={clsx(styles['conversation-wrapper'])}
                                onClick={() => addGroupToChatList(groupChat)}
                            >
                                <div className={clsx(styles['conversation'])}>
                                    <img className={clsx(styles['avatar'])} src={groupChat?.avatar || defaultAvatar} />
                                    <div>
                                        <h6 className={clsx(styles['name'])}>{groupChat?.name}</h6>
                                        <div className={clsx(styles['last-message'])}>Không biết nữa</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div>
                    <div className={clsx(styles['create-group-header'])}>
                        <div className={clsx(styles['create-group-header-left'])}>
                            <FontAwesomeIcon
                                className={clsx(styles['create-group-header-back'])}
                                icon={faArrowLeft}
                                onClick={handleHideCreateNewGroup}
                            />
                            <span className={clsx(styles['create-group-header-title'])}>Nhóm mới</span>
                        </div>
                        <div
                            className={clsx(styles['create-group-header-btn'], {
                                [[styles['active']]]: false,
                            })}
                            onClick={handleCreateGroupChat}
                        >
                            Tạo
                        </div>
                    </div>
                    <input
                        className={clsx(styles['create-group-name'])}
                        placeholder="Tên nhóm"
                        onChange={(e) =>
                            setInfoNewGroupChat((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                    />
                    <div className={clsx(styles['create-group-search'])}>
                        <FontAwesomeIcon
                            className={clsx(styles['create-group-search-icon'])}
                            icon={faMagnifyingGlass}
                        />
                        <input className={clsx(styles['create-group-search-input'])} placeholder="Tìm kiếm" />
                    </div>
                    <div className={clsx(styles['create-group-suggestion-title'])}>Gợi ý</div>
                    <div className={clsx(styles['create-group-suggestion-members'])}>
                        {onlineFriends?.map((friend) => {
                            return (
                                <div
                                    key={`friend-${friend?.id}`}
                                    className={clsx(styles['create-group-suggestion-member'])}
                                >
                                    <div className={clsx(styles['create-group-suggestion-member-info'])}>
                                        <img
                                            className={clsx(styles['create-group-suggestion-member-avatar'])}
                                            src={friend?.avatar || defaultAvatar}
                                        />
                                        <div className={clsx(styles['create-group-suggestion-member-name'])}>
                                            {friend?.lastName} {friend?.firstName}
                                        </div>
                                    </div>
                                    <div className={clsx(styles['create-group-suggestion-member-checkbox'])}>
                                        <input
                                            id={`create-group-suggestion-member-checkbox-${friend?.id}`}
                                            value={friend?.id}
                                            type="checkbox"
                                            onChange={(e) =>
                                                setInfoNewGroupChat((prev) => ({
                                                    ...prev,
                                                    members: [...prev.members, e.target.value],
                                                }))
                                            }
                                        />
                                        <label
                                            htmlFor={`create-group-suggestion-member-checkbox-${friend?.id}`}
                                        ></label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messenger;
