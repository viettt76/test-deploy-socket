import { lazy } from 'react';

import OnlyHeaderLayout from '~/layouts/OnlyHeaderLayout';
import FriendsLayout from '~/layouts/FriendsLayout';

import Home from '~/pages/Home';
const Login = lazy(() => import('~/pages/Login'));
import Profile from '~/pages/Profile/Profile';
import MyFriends from '~/pages/MyFriends';
import FriendRequests from '~/pages/FriendRequests';
import FriendSuggestions from '~/pages/FriendSuggestions';
import SentFriendRequests from '~/pages/SentFriendRequests';

const routes = [
    { path: '/', element: Home },
    { path: '/login', element: Login, layout: null },
    { path: '/profile/:userId/*', element: Profile, layout: OnlyHeaderLayout },
    { path: '/friends', element: MyFriends, layout: FriendsLayout },
    { path: '/friends/requests', element: FriendRequests, layout: FriendsLayout },
    { path: '/friends/sent-requests', element: SentFriendRequests, layout: FriendsLayout },
    { path: '/friends/suggestions', element: FriendSuggestions, layout: FriendsLayout },
];

export default routes;
