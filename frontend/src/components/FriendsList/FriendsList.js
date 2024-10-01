import clsx from 'clsx';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import styles from './FriendsList.module.scss';
import ChatPopup from '~/components/ChatPopup';
import socket from '~/socket';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import * as actions from '~/redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { openChatsSelector } from '~/redux/selectors';
import ChatGroupPopup from '~/components/ChatGroupPopup';

const FriendsList = () => {
    const dispatch = useDispatch();

    const openChats = useSelector(openChatsSelector);

    const [onlineFriends, setOnlineFriends] = useState([]);

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

    const addToChatList = (friend) => {
        dispatch(actions.openChat(friend));
    };

    return (
        <div>
            <ul className={clsx(styles['friends-list-wrapper'])}>
                <div className={clsx(styles['title'])}>Bạn bè</div>
                {onlineFriends?.map((friend, index) => {
                    return (
                        <li
                            key={`friend-${index}`}
                            className={clsx(styles['friend'])}
                            onClick={() => addToChatList(friend)}
                        >
                            <div
                                className={clsx(styles['friend-avatar'], {
                                    [[styles['is-online']]]: friend?.isOnline,
                                })}
                            >
                                <img src={friend?.avatar || defaultAvatar} />
                            </div>
                            <div
                                className={clsx(styles['friend-name'])}
                            >{`${friend?.lastName} ${friend?.firstName}`}</div>
                        </li>
                    );
                })}
            </ul>
            {openChats?.slice(0, 2)?.map((item) => {
                if (item?.isGroupChat) {
                    return <ChatGroupPopup key={`group-chat-${item?.id}`} group={item} />;
                }
                return <ChatPopup key={`friend-chat-${item?.id}`} friend={item} />;
            })}
        </div>
    );
};

export default FriendsList;
