import clsx from 'clsx';
import styles from './Friend.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';

const Friend = ({
    type,
    id,
    firstName = '',
    lastName = '',
    avatar,
    numberOfCommonFriends = 0,
    handleSendFriendRequest,
    handleRefuseFriendRequest,
    handleAcceptFriendship,
    handleShowModalUnfriend,
    handleCancelFriendRequest,
}) => {
    return (
        <div className={clsx(styles['friend-wrapper'])}>
            <img className={clsx(styles['friend-avatar'])} src={avatar || defaultAvatar} />
            <div className={clsx(styles['friend-detail'])}>
                <div className={clsx(styles['friend-name'])}>{`${lastName} ${firstName}`}</div>
                {numberOfCommonFriends > 0 && (
                    <div className={clsx(styles['mutual-friends'])}>{numberOfCommonFriends} bạn chung</div>
                )}
                {type === 'friend' && (
                    <div className={clsx(styles['actions'])}>
                        <button className="btn btn-primary fz-16 w-100">Nhắn tin</button>
                        <button
                            className="btn btn-danger fz-16 w-100 mt-2"
                            onClick={() => handleShowModalUnfriend(id, firstName, lastName)}
                        >
                            Huỷ kết bạn
                        </button>
                    </div>
                )}
                {type === 'friend-request' && (
                    <div className={clsx(styles['actions'])}>
                        <button className="btn btn-primary fz-16 w-100" onClick={() => handleAcceptFriendship(id)}>
                            Chấp nhận
                        </button>
                        <button
                            className="btn btn-danger fz-16 w-100 mt-2"
                            onClick={() => handleRefuseFriendRequest(id)}
                        >
                            Từ chối
                        </button>
                    </div>
                )}
                {type === 'friend-suggestion' && (
                    <div className={clsx(styles['actions'])}>
                        <button className="btn btn-primary fz-16 w-100" onClick={() => handleSendFriendRequest(id)}>
                            Thêm bạn bè
                        </button>
                    </div>
                )}
                {type === 'sent-friend-request' && (
                    <div className={clsx(styles['actions'])}>
                        <button
                            className="btn btn-danger fz-16 w-100 mt-2"
                            onClick={() => handleCancelFriendRequest(id)}
                        >
                            Huỷ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friend;
