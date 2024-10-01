import clsx from 'clsx';
import styles from './UserProfileViewer.module.scss';
import UserProfileViewerHeader from './UserProfileViewerHeader';

const UserProfileViewer = () => {
    return (
        <div className={clsx('container', styles['profile-wrapper'])}>
            <UserProfileViewerHeader />
        </div>
    );
};

export default UserProfileViewer;
