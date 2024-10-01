import clsx from 'clsx';
import styles from './SidebarFriends.module.scss';
import { Link, useLocation } from 'react-router-dom';

const SidebarFriends = () => {
    const location = useLocation();

    return (
        <div className={clsx(styles['sidebar-wrapper'])}>
            <div className={clsx(styles['sidebar-title'])}>Bạn bè</div>
            <Link
                to="/friends"
                className={clsx(styles['sidebar-item'], {
                    [[styles['active']]]: location.pathname === '/friends',
                })}
            >
                Danh sách bạn bè
            </Link>
            <Link
                to="/friends/requests"
                className={clsx(styles['sidebar-item'], {
                    [[styles['active']]]: location.pathname === '/friends/requests',
                })}
            >
                Lời mời kết bạn
            </Link>
            <Link
                to="/friends/sent-requests"
                className={clsx(styles['sidebar-item'], {
                    [[styles['active']]]: location.pathname === '/friends/sent-requests',
                })}
            >
                Lời mời đã gửi
            </Link>
            <Link
                to="/friends/suggestions"
                className={clsx(styles['sidebar-item'], {
                    [[styles['active']]]: location.pathname === '/friends/suggestions',
                })}
            >
                Gợi ý
            </Link>
        </div>
    );
};

export default SidebarFriends;
