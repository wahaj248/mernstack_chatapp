import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice'
import Sidebar from '../components/Sidebar'
import logo from '../assets/talkup.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import your notification sound
import notificationSound from '../assets/notification.mp3';
import ringtone from '../assets/ringtone.mp3';
import axiosFetch from '../axios'
import { BASE_URL } from './BaseUrl'
// import getSocketInstance from '../socketSingleton'
import { io } from 'socket.io-client'


const Home = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const location = useLocation()
  const params = useParams()
  const userToken = useSelector(state => state?.user?.token)
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const [showCallModal, setShowCallModal] = useState(false);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [callerInfo, setCallerInfo] = useState(null);
  const [callTimeout, setCallTimeout] = useState(null);  // State to manage call timeout
  const ringtoneRef = useRef(new Audio(ringtone));
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  })

  // console.log('user', user)
  const fetchUserDetails = async () => {
    try {
      const URL = `${BASE_URL}/api/user-details`
      const response = await axiosFetch(URL);
      dispatch(setUser(response.data.data))

      // if (response.data.data.logout) {
      //   dispatch(logout())
      //   navigate("/email")
      // }
      console.log("current user Details", response)
    } catch (error) {
      console.log("error", error)
    }
  }

  useEffect(() => {
    const music = ringtoneRef.current;

    if (showIncomingCallModal) {
      // Play ringtone when the modal is visible
      music.loop = true; // Ensure it loops while the modal is visible
      music.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    } else {
      // Stop the ringtone when the modal is not visible
      music.pause();
      music.currentTime = 0; // Reset to the beginning
    }

    return () => {
      // Ensure the audio stops when the component unmounts
      music.pause();
      music.currentTime = 0;
    };
  }, [showIncomingCallModal]);

  // Handle showing the call modal
  const handleShowCallModal = () => {
    setShowCallModal(true);
  };

  // Handle closing the call modal
  const handleCloseCallModal = () => {
    setShowCallModal(false);
  };

  // Handle starting the call with a dynamic URL or socket event
  const generateRoomId = () => Math.random().toString(36).substring(2, 15);

  // Handle starting the call with a dynamic URL or socket event
  const handleStartCall = () => {
    const roomId = generateRoomId();  // Generate a unique room ID
    socketConnection.emit('start-call', {
      callerId: user._id,
      receiverId: dataUser._id,
      roomId // Send the room ID to the receiver
    });

    // Open the call page with the room ID as a URL parameter
    window.open(`https://cadprouk.com/join?room=${roomId}`, "_blank");
    setShowCallModal(false);
  };

  useEffect(() => {
    fetchUserDetails()
  }, [])

  /***socket connection */
  useEffect(() => {
    const socketConnection = io(BASE_URL, {
      auth: {
        token: localStorage.getItem('token')
      },
    })
    socketConnection.on("connection", (socket) => console.log(`SOCKET CONNECTED ${socket.id}`))
    socketConnection.on('onlineUser', (data) => {
      console.log(data)
      dispatch(setOnlineUser(data))
    })

    socketConnection.on('new message', (messageData) => {
      // Show a toast notification for the new message
      toast(<span><strong>{messageData.senderName}</strong>: {messageData.text}</span>);
      // Play notification sound
      const audio = new Audio(notificationSound);
      audio.play().catch((err) => console.error('Audio playback failed:', err));
    });

    dispatch(setSocketConnection(socketConnection))

    return () => {
      socketConnection.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socketConnection) {
      socketConnection.on('incoming-call', (callerInfo) => {
        // Only show the incoming call modal if we're in the message page
        if (params.userId === callerInfo?.receiverId) {
          setCallerInfo(callerInfo);
          setShowIncomingCallModal(true);

          // Set a timeout to automatically reject the call after 10 seconds
          const timeoutId = setTimeout(() => {
            handleRejectCall(); // Auto-reject the call
          }, 60000); // 1 minute timeout
          setCallTimeout(timeoutId); // Save timeout ID
        }
      });

      socketConnection.emit('message-page', params.userId);
    }
  }, [socketConnection, params.userId]);

  const handleRejectCall = () => {

    setShowIncomingCallModal(false);
    if (callTimeout) {
      clearTimeout(callTimeout);
    }

    socketConnection.emit('call-rejected', { callerId: callerInfo?.callerId, receiverId: user._id });
  };

  const handleAcceptCall = () => {
    setShowIncomingCallModal(false);

    if (callTimeout) {
      clearTimeout(callTimeout);
    }
    const roomId = callerInfo?.roomId;
    socketConnection.emit('accept-call', { roomId, callerId: callerInfo?.callerId, receiverId: user._id });
    window.open(`https://cadprouk.com/join?room=${roomId}`, "_blank");
  };


  const basePath = location.pathname === '/'
  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      {/**message component**/}
      <section className={`${basePath && "hidden"}`} >
        <Outlet />
      </section>


      <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
        <div>
          <img
            src={logo}
            width={250}
            alt='logo'
          />
        </div>
        <p className='text-lg mt-2 text-slate-500'>Select user to send message</p>
      </div>

      {/* Incoming Call Modal */}
      {showIncomingCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">Incoming Call</h2>
            <p className="mb-6">You have an incoming call from {callerInfo?.callerName}</p>
            <button onClick={handleAcceptCall} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Accept</button>
            <button onClick={handleRejectCall} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
          </div>
        </div>
      )}
      {/* ToastContainer to render the toast notifications */}
      <ToastContainer />
    </div>
  )
}

export default Home
