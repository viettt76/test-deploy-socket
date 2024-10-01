import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Post from '~/components/Post';
import WritePost from '~/components/WritePost';
import { getAllPostsService } from '~/services/postServices';
import * as actions from '~/redux/actions';
import { loadingSelector } from '~/redux/selectors';
import { Facebook } from 'react-content-loader';
import socket from '~/socket';

const Home = () => {
    const dispatch = useDispatch();
    const loading = useSelector(loadingSelector);

    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                dispatch(actions.startLoading('HomePosts'));
                const res = await getAllPostsService();
                setPosts(res);
            } catch (error) {
                console.log(error);
            } finally {
                dispatch(actions.stopLoading('HomePosts'));
            }
        };
        fetchAllPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleNewPost = (newPost) => {
            setPosts((prev) => [newPost, ...prev]);
        };
        socket.on('newPost', handleNewPost);

        return () => {
            socket.off('newPost', handleNewPost);
        };
    }, []);

    return (
        <div className="mt-5" style={{ width: '50rem' }}>
            <WritePost />
            {loading?.HomePosts ? (
                <Facebook />
            ) : posts?.length === 0 ? (
                <div className="text-center fz-16">
                    <div>Hãy kết bạn để xem những bài viết thú vị hơn</div>
                    <Link to="/friends/suggestions">Tìm thêm bạn bè</Link>
                </div>
            ) : (
                posts?.map((post) => <Post key={`post-${post?.id}`} postInfo={post} />)
            )}
        </div>
    );
};

export default Home;
