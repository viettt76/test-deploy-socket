import Header from '~/components/Header';
import Sidebar from '~/components/Sidebar';
import FriendsList from '~/components/FriendsList';

const DefaultLayout = ({ children }) => {
    return (
        <div>
            <Header />
            <div className="d-flex justify-content-between">
                <Sidebar />
                <div>{children}</div>
                <FriendsList />
            </div>
        </div>
    );
};

export default DefaultLayout;
