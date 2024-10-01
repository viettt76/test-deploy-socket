import clsx from 'clsx';
import styles from './UserProfileOwner.module.scss';
import UserProfileOwnerHeader from './UserProfileOwnerHeader';

const UserProfileOwner = () => {
    return (
        <div className={clsx('container', styles['profile-wrapper'])}>
            <UserProfileOwnerHeader />
        </div>
    );
};

export default UserProfileOwner;
