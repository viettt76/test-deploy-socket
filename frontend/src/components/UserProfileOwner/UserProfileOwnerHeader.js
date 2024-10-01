import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faPencil } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import styles from './UserProfileOwner.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { updateMyInfoService } from '~/services/userServices';
import * as actions from '~/redux/actions';
import Cropper from 'react-easy-crop';
import axios from 'axios';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { Link, useLocation } from 'react-router-dom';

const UserProfileOwnerHeader = () => {
    const dispatch = useDispatch();
    const userInfo = useSelector(userInfoSelector);

    const location = useLocation();

    const [updateAvatar, setUpdateAvatar] = useState(null);
    const [showModalUpdateAvatar, setShowModalUpdateAvatar] = useState(false);

    const handleChooseFile = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (s) => {
                setUpdateAvatar(s.target.result);
                setShowModalUpdateAvatar(true);
            };

            reader.readAsDataURL(file);
        }
    };

    const handleHideModalUpdateAvatar = () => setShowModalUpdateAvatar(false);

    const getCroppedImg = (imageSrc, crop) => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imageSrc;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = crop.width;
                canvas.height = crop.height;

                ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        return reject('Canvas is empty');
                    }
                    const fileUrl = URL.createObjectURL(blob);
                    resolve(fileUrl);
                }, 'image/jpeg');
            };
            image.onerror = reject;
        });
    };

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const uploadToCloudinary = async (croppedImage) => {
        let formData = new FormData();

        formData.append('api_key', import.meta.env.VITE_CLOUDINARY_KEY);
        formData.append('file', croppedImage);
        formData.append('public_id', `file_${Date.now()}`);
        formData.append('timestamp', (Date.now() / 1000) | 0);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        try {
            const res = await axios.post(import.meta.env.VITE_CLOUDINARY_URL, formData);
            return res.data?.secure_url;
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
        }
    };

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(updateAvatar, croppedAreaPixels);
            const file = await fetch(croppedImage)
                .then((res) => res.blob())
                .then((blob) => new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
            const imageUrl = await uploadToCloudinary(file);
            await updateMyInfoService({ avatar: imageUrl });

            dispatch(actions.saveUserInfo({ avatar: imageUrl }));
            handleHideModalUpdateAvatar();
        } catch (error) {
            console.error('Failed to crop image', error);
        }
    };

    return (
        <>
            <div className={clsx(styles['header'])}>
                <div className={clsx(styles['header-left'])}>
                    <img className={clsx(styles['avatar'])} src={userInfo?.avatar || defaultAvatar} />
                    <div>
                        <h3 className={clsx(styles['full-name'])}>{`${userInfo.lastName} ${userInfo.firstName}`}</h3>
                        <div className={clsx(styles['number-of-friends'])}>207 bạn bè</div>
                    </div>
                </div>
                <div className={clsx(styles['header-right'])}>
                    <label htmlFor="change-avatar-input" className={clsx(styles['edit-profile-btn'])}>
                        <FontAwesomeIcon icon={faPencil} />
                        <span>Đổi ảnh đại diện</span>
                        <Modal
                            className={clsx(styles['modal'])}
                            show={showModalUpdateAvatar}
                            onHide={handleHideModalUpdateAvatar}
                        >
                            <Modal.Header>
                                <Modal.Title>Chọn ảnh đại diện</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className={clsx(styles['modal-body'])}>
                                <div className={clsx(styles['crop-container'])}>
                                    <Cropper
                                        image={updateAvatar}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        onCropChange={setCrop}
                                        onCropComplete={onCropComplete}
                                        onZoomChange={setZoom}
                                        cropShape="round"
                                        showGrid={false}
                                    />
                                </div>
                                <div className={clsx(styles['controls'])}>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => {
                                            setZoom(e.target.value);
                                        }}
                                        className={clsx(styles['zoom-range'])}
                                    />
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <div className="d-flex align-items-revert">
                                    <div className={clsx(styles['btn-cancel'])} onClick={handleHideModalUpdateAvatar}>
                                        Huỷ
                                    </div>
                                    <Button variant="primary" className="fz-16" onClick={handleSave}>
                                        Xác nhận
                                    </Button>
                                </div>
                            </Modal.Footer>
                        </Modal>
                    </label>
                    <input type="file" id="change-avatar-input" hidden onChange={handleChooseFile} />
                    <div className={clsx(styles['header-right-menu'])}>
                        <FontAwesomeIcon icon={faEllipsis} />
                    </div>
                </div>
            </div>
            <div className={clsx(styles['profile-tabs-wrapper'])}>
                <Link
                    className={clsx(styles['profile-tabs'], {
                        [[styles['active']]]: location.pathname === `/profile/${userInfo?.id}`,
                    })}
                    to={`/profile/${userInfo?.id}`}
                >
                    Bài đăng
                </Link>
                <Link
                    className={clsx(styles['profile-tabs'], {
                        [[styles['active']]]: location.pathname === `/profile/${userInfo?.id}/friends`,
                    })}
                    to={`/profile/${userInfo?.id}/friends`}
                >
                    Bạn bè
                </Link>
                <Link
                    className={clsx(styles['profile-tabs'], {
                        [[styles['active']]]: location.pathname === `/profile/${userInfo?.id}/photos`,
                    })}
                    to={`/profile/${userInfo?.id}/photos`}
                >
                    Ảnh
                </Link>
            </div>
        </>
    );
};

export default UserProfileOwnerHeader;
