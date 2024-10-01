import { io } from 'socket.io-client';

// const socket = io('https://heyoy-social-network-backend.vercel.app', {
//     withCredentials: true,
//     // transports: ['websocket', 'polling'],
// });

const socket = io('https://test-deploy-socket.onrender.com', {
    withCredentials: true,
});

export default socket;
