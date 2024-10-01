import clsx from 'clsx';
import Friend from '~/components/Friend';
import styles from './MyFriends.module.scss';
import { useEffect, useState } from 'react';
import { allFriendsService, unfriendService } from '~/services/relationshipServices';
import { Link } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import socket from '~/socket';

const MyFriends = () => {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchAllFriends = async () => {
            try {
                const res = await allFriendsService();
                setFriends(res);
            } catch (error) {
                console.log(error);
            }
        };

        fetchAllFriends();
    }, []);

    useEffect(() => {
        const handleAcceptFriendRequest = (friendInfo) => {
            setFriends((prev) => [friendInfo, ...prev]);
        };

        const handleUnfriend = (friendId) => {
            setFriends((prev) => prev.filter((f) => f?.id !== friendId));
        };

        socket.on('acceptFriendRequest', handleAcceptFriendRequest);
        socket.on('unfriend', handleUnfriend);

        return () => {
            socket.off('acceptFriendRequest', handleAcceptFriendRequest);
            socket.off('unfriend', handleUnfriend);
        };
    }, []);

    const handleUnfriend = async () => {
        try {
            if (currentUnfriend?.id) {
                await unfriendService(currentUnfriend.id);

                setFriends((prev) => prev.filter((f) => f?.id !== currentUnfriend.id));
            }
        } catch (error) {
            console.log(error);
        } finally {
            setCurrentUnfriend(null);
            setShowModalUnfriend(false);
        }
    };

    const [showModalUnfriend, setShowModalUnfriend] = useState(false);
    const [currentUnfriend, setCurrentUnfriend] = useState(null);

    const handleShowModalUnfriend = (id, firstName, lastName) => {
        setShowModalUnfriend(true);
        setCurrentUnfriend({
            id,
            firstName,
            lastName,
        });
    };
    const handleHideModalUnfriend = () => setShowModalUnfriend(false);

    return (
        <>
            {friends?.length === 0 ? (
                <div className="mt-3 w-100 text-center fz-16">
                    <div>Bạn chưa có bạn bè</div>
                    <Link to="/friends/suggestions">Hãy kết bạn thêm nào</Link>
                </div>
            ) : (
                <div className={clsx(styles['friends-wrapper'])}>
                    {friends?.map((friend) => (
                        <Friend
                            key={`friend-${friend?.id}`}
                            type="friend"
                            id={friend?.id}
                            firstName={friend?.firstName}
                            lastName={friend?.lastName}
                            avatar={friend?.avatar}
                            numberOfCommonFriends={friend?.numberOfCommonFriends}
                            handleShowModalUnfriend={handleShowModalUnfriend}
                        />
                    ))}
                </div>
            )}
            <Modal show={showModalUnfriend} className={clsx(styles['modal'])} onHide={handleHideModalUnfriend}>
                <Modal.Header className="d-flex justify-content-center">
                    <Modal.Title className={clsx(styles['modal-title'])}>
                        Huỷ kết bạn với {currentUnfriend?.lastName} {currentUnfriend?.firstName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={clsx(styles['modal-body'])}>
                    <div className="fz-16 text-center">
                        Bạn có chắc chắn muốn huỷ kết bạn với {currentUnfriend?.lastName} {currentUnfriend?.firstName}{' '}
                        không?
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex align-items-revert">
                        <div className={clsx(styles['btn-cancel'])} onClick={handleHideModalUnfriend}>
                            Huỷ
                        </div>
                        <Button variant="primary" className="fz-16" onClick={handleUnfriend}>
                            Xác nhận
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MyFriends;
