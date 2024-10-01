import { useSelector } from 'react-redux';
import { Route, Routes, useParams } from 'react-router-dom';
import UserProfileOwner from '~/components/UserProfileOwner';
import UserProfileOwnerPost from '~/components/UserProfileOwner/UserProfileOwnerPost';
import UserProfilePhotos from '~/components/UserProfilePhotos';
import UserProfileViewer from '~/components/UserProfileViewer';
import UserProfileViewerPost from '~/components/UserProfileViewer/UserProfileViewerPost';
import { userInfoSelector } from '~/redux/selectors';

const Profile = () => {
    const { userId } = useParams();
    const userInfo = useSelector(userInfoSelector);

    const isOwner = userInfo?.id === userId;

    return (
        <>
            {userInfo?.id ? isOwner ? <UserProfileOwner /> : <UserProfileViewer /> : <></>}

            <Routes>
                <Route
                    path=""
                    element={userInfo?.id ? isOwner ? <UserProfileOwnerPost /> : <UserProfileViewerPost /> : <></>}
                />
                <Route path="photos" element={userInfo?.id ? <UserProfilePhotos userId={userId} /> : <></>} />
            </Routes>
        </>
    );
};

export default Profile;
