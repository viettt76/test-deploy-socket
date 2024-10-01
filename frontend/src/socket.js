import { io } from 'socket.io-client';

// const socket = io('https://heyoy-social-network-backend.vercel.app', {
//     withCredentials: true,
//     // transports: ['websocket', 'polling'],
// });

const socket = io('http://localhost:8080', {
    withCredentials: true,
});

export default socket;
