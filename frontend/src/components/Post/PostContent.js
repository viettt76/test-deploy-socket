import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { faEarthAmerica, faLock, faShare, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import styles from './Post.module.scss';
import { LikeIcon, LoveIcon, LoveLoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '~/components/Icons';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import {
    cancelReleasedEmotionPostService,
    getAllEmotionsService,
    getCommentsService,
    releaseEmotionPostService,
} from '~/services/postServices';
import _ from 'lodash';
import socket from '~/socket';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import { format } from 'date-fns';

const PostContent = ({ postInfo, handleShowWriteComment, showModal, handleShowModal, handleFocusSendComment }) => {
    const {
        id,
        posterId,
        firstName,
        lastName,
        avatar,
        groupName,
        createdAt,
        visibility,
        content,
        currentEmotionId,
        currentEmotionName,
        emotions = [],
        pictures = [],
    } = postInfo;
    const userInfo = useSelector(userInfoSelector);

    const [copyEmotions, setCopyEmotions] = useState(emotions);
    const [emotionsCustom, setEmotionsCustom] = useState([]);
    const [mostEmotions, setMostEmotions] = useState([]);
    const [currentEmotionNameCustom, setCurrentEmotionNameCustom] = useState(currentEmotionName);

    const [numberOfComments, setNumberOfComments] = useState(0);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await getCommentsService({ postId: id });
                setNumberOfComments(res?.numberOfComments);
            } catch (error) {
                console.log(error);
            }
        };
        fetchComments();
    }, [id]);

    useEffect(() => {
        const emoCus = _.groupBy(copyEmotions, 'emotion.name');
        setEmotionsCustom(emoCus);

        const mostEmo = _.sortBy(emoCus, 'length').reverse();
        if (mostEmo.length > 0) {
            setMostEmotions([mostEmo[0][0]?.emotion?.name]);
            if (mostEmo.length > 1) {
                setMostEmotions((prev) => [...prev, mostEmo[1][0]?.emotion?.name]);
            }
        } else {
            setMostEmotions([]);
        }
    }, [copyEmotions]);

    const maxVisibleImages = 4;
    let visibleImages;
    let remainingImages;
    if (pictures?.length > maxVisibleImages) {
        visibleImages = pictures.slice(0, maxVisibleImages - 1);
        remainingImages = pictures.length - maxVisibleImages + 1;
    } else {
        visibleImages = [...pictures];
    }

    const [emotionsType, setEmotionsType] = useState([]);

    useEffect(() => {
        const fetchAllEmotions = async () => {
            try {
                const res = await getAllEmotionsService();
                setEmotionsType(res);
            } catch (error) {
                console.log(error);
            }
        };
        fetchAllEmotions();
    }, []);

    const emotionComponentMap = {
        Thích: LikeIcon,
        'Yêu thích': LoveIcon,
        'Thương thương': LoveLoveIcon,
        Haha: HaHaIcon,
        Wow: WowIcon,
        Buồn: SadIcon,
        'Phẫn nộ': AngryIcon,
    };

    const emotionClassMap = {
        Thích: styles['like-emotion'],
        'Yêu thích': styles['love-emotion'],
        'Thương thương': styles['loveLove-emotion'],
        Haha: styles['haha-emotion'],
        Wow: styles['wow-emotion'],
        Buồn: styles['sad-emotion'],
        'Phẫn nộ': styles['angry-emotion'],
    };

    const CurrentEmotion = emotionComponentMap[currentEmotionNameCustom];

    useEffect(() => {
        const handleReleaseEmotion = ({
            id: emoPostId,
            postId,
            userId: reactorId,
            firstName: reactorFirstName,
            lastName: reactorLastName,
            avatar: reactorAvatar,
            emotionTypeId,
            emotionTypeName,
        }) => {
            if (id === postId) {
                setCopyEmotions((prev) => [
                    ...prev,
                    {
                        id: emoPostId,
                        emotion: {
                            id: emotionTypeId,
                            name: emotionTypeName,
                        },
                        userInfo: {
                            id: reactorId,
                            firstName: reactorFirstName,
                            lastName: reactorLastName,
                            avatar: reactorAvatar,
                        },
                    },
                ]);
            }
        };

        const handleUpdateEmotion = ({ id: emoPostId, postId, emotionTypeId, emotionTypeName }) => {
            if (id === postId) {
                setCopyEmotions((prev) => {
                    const clone = _.cloneDeep(prev);
                    const emo = _.find(clone, { id: emoPostId });
                    if (emo) {
                        emo.emotion.id = emotionTypeId;
                        emo.emotion.name = emotionTypeName;
                    }
                    return clone;
                });
            }
        };

        socket.on('releaseEmotion', handleReleaseEmotion);
        socket.on('updateEmotion', handleUpdateEmotion);

        return () => {
            socket.off('releaseEmotiff', handleReleaseEmotion);
            socket.off('updateEmotion', handleUpdateEmotion);
        };
    }, [id]);

    const [showEmotionList, setShowEmotionList] = useState(false);
    const handleReleaseEmotion = async (emotionId) => {
        try {
            setShowEmotionList(false);
            await releaseEmotionPostService({ postId: id, emotionId });
            setCurrentEmotionNameCustom(emotionsType.find((emo) => emo.id === emotionId).name);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const handleCancelReleasedEmotion = ({ postId, userId: userCancelReleaseEmotionId }) => {
            if (userInfo.id === userCancelReleaseEmotionId && id === postId) {
                setCurrentEmotionNameCustom(null);

                setCopyEmotions((prev) => {
                    const clone = _.filter(prev, (e) => e?.userInfo?.id !== userCancelReleaseEmotionId);
                    return clone;
                });
            }
        };
        socket.on('cancelReleasedEmotion', handleCancelReleasedEmotion);

        return () => {
            socket.off('cancelReleasedEmotion', handleCancelReleasedEmotion);
        };
    }, [id, userInfo.id]);

    const handleCancelReleasedEmotion = async () => {
        try {
            await cancelReleasedEmotionPostService({ postId: id });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const handleNewCommentNumberOfComments = (postId) => {
            if (id === postId) {
                setNumberOfComments((prev) => prev + 1);
            }
        };
        socket.on('newComment-numberOfComments', handleNewCommentNumberOfComments);

        return () => {
            socket.off('newComment-numberOfComments', handleNewCommentNumberOfComments);
        };
    }, [id]);

    return (
        <div className={clsx(styles['post-content-wrapper'])}>
            <div className={clsx(styles['post-header'])}>
                <Link to={`/profile/${posterId}`}>
                    <img
                        className={clsx(styles['avatar-user'])}
                        src={avatar || defaultAvatar}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                        }}
                    />
                </Link>
                <div>
                    <h5 className={clsx(styles['post-username'])}>{`${lastName} ${firstName}`}</h5>
                    <div className={clsx('d-flex', styles['add-info'])}>
                        {groupName && <span>Quốc</span>}
                        <span>{format(new Date(createdAt), 'dd/MM/yyyy')}</span>
                        <span>
                            <FontAwesomeIcon icon={faEarthAmerica} />
                            {/* <FontAwesomeIcon icon={faUserGroup} />
                            <FontAwesomeIcon icon={faLock} /> */}
                        </span>
                    </div>
                </div>
            </div>
            <div className={clsx(styles['post-content'], styles['background'])}>{content && <div>{content}</div>}</div>
            <div
                className={clsx(styles['images-layout'], {
                    [styles[`layout-${visibleImages?.length}`]]: remainingImages <= 0 || !remainingImages,
                    [styles[`layout-remaining`]]: remainingImages > 0,
                })}
            >
                {visibleImages?.map((img, index) => {
                    return (
                        <Link className={clsx(styles['image-wrapper'])} key={`image-${index}`}>
                            <img src={img?.pictureUrl} />
                        </Link>
                    );
                })}
                {remainingImages > 0 && <Link className={clsx(styles['overlay'])}>+{remainingImages}</Link>}
            </div>
            <div className={clsx(styles['emotions-amount-of-comments'])}>
                <div className={clsx(styles['emotions-wrapper'])}>
                    {mostEmotions?.map((emo) => {
                        const Icon = emotionComponentMap[emo];
                        return (
                            <div key={`most-emotion-${emo}`} className={clsx(styles['emotion'])}>
                                <Icon width={18} height={18} />
                            </div>
                        );
                    })}
                    {copyEmotions?.length > 0 && (
                        <div className={clsx(styles['amount-of-emotions'])}>{copyEmotions?.length}</div>
                    )}
                </div>

                <div className={clsx(styles['amount-of-comments-wrapper'])}>
                    <span onClick={handleShowModal}>{numberOfComments || 0} bình luận</span>
                    <span>32 chia sẻ</span>
                </div>
            </div>
            <div className={clsx(styles['user-actions-wrapper'])}>
                <div
                    className={clsx(styles['user-action'], styles['show-emotion-list'])}
                    onMouseEnter={() => setShowEmotionList(true)}
                >
                    {currentEmotionNameCustom ? (
                        <div className={clsx(styles['user-action-emotion'])} onClick={handleCancelReleasedEmotion}>
                            <CurrentEmotion width={20} height={20} />
                            <span
                                className={clsx(emotionClassMap[currentEmotionNameCustom], styles['released-emotion'])}
                            >
                                {currentEmotionNameCustom}
                            </span>
                        </div>
                    ) : (
                        <div className={clsx(styles['user-action-emotion'])} onClick={() => handleReleaseEmotion(1)}>
                            <FontAwesomeIcon icon={faThumbsUp} />
                            <span>Thích</span>
                        </div>
                    )}
                    {showEmotionList && (
                        <ul className={clsx(styles['emotion-list'], {})}>
                            {emotionsType?.map((emotion) => {
                                const Icon = emotionComponentMap[emotion?.name];
                                return (
                                    <li
                                        key={`emotion-${emotion?.id}`}
                                        className={clsx(styles['emotion'])}
                                        onClick={() => handleReleaseEmotion(emotion?.id)}
                                    >
                                        <Icon width={39} height={39} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <div
                    className={clsx(styles['user-action'])}
                    onClick={showModal ? handleFocusSendComment : handleShowWriteComment}
                >
                    <FontAwesomeIcon icon={faComment} />
                    <span>Bình luận</span>
                </div>
                <div className={clsx(styles['user-action'])}>
                    <FontAwesomeIcon icon={faShare} />
                    <span>Chia sẻ</span>
                </div>
            </div>
        </div>
    );
};

export default PostContent;
