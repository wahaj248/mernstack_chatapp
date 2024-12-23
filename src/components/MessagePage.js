import React, { useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { TiTick } from "react-icons/ti";
import Avatar from './Avatar'
import { IoMdCall } from "react-icons/io";
import { FaAngleLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import uploadFile from '../helpers/uploadFile';
import { IoClose } from "react-icons/io5";
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg'
import { IoMdSend } from "react-icons/io";
import moment from 'moment'
import ringtone from '../assets/ringtone.mp3';
import myContext from '../context/myContext';

const MessagePage = () => {
  const params = useParams()
  const user = useSelector(state => state?.user)
  const context = useContext(myContext);
  
  const {  socketConnection  } = context;
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  })
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false)
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  })
  const [loading, setLoading] = useState(false)
  const [allMessage, setAllMessage] = useState([])
  const [allMessageGroup, setAllMessageGroup] = useState([])

  const [showCallModal, setShowCallModal] = useState(false);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [callerInfo, setCallerInfo] = useState(null);
  const currentMessage = useRef(null)
  const [callTimeout, setCallTimeout] = useState(null);  // State to manage call timeout
  const ringtoneRef = useRef(new Audio(ringtone));

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [allMessage, allMessageGroup])

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

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(preve => !preve)
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return {
        ...preve,
        imageUrl: uploadPhoto.url
      }
    })
  }
  const handleClearUploadImage = () => {
    setMessage(preve => {
      return {
        ...preve,
        imageUrl: ""
      }
    })
  }

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return {
        ...preve,
        videoUrl: uploadPhoto.url
      }
    })
  }
  const handleClearUploadVideo = () => {
    setMessage(preve => {
      return {
        ...preve,
        videoUrl: ""
      }
    })
  }

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
    const roomId = generateRoomId();
    if (dataUser?.type == "user") {
      socketConnection.emit('start-call', {
        callerId: user._id,
        receiverId: dataUser._id,
        roomId // Send the room ID to the receiver
      });
    }
    else {
      socketConnection.emit('start:group:call', {
        members: dataUser?.members,
        roomId ,// Send the room ID to the receiver
        groupName: dataUser?.name,

      })

    }






    // Open the call page with the room ID as a URL parameter
    window.open(`https://cadprouk.com/join?room=${roomId}`, "_blank");
    setShowCallModal(false);
  };


  useEffect(() => {
    if (socketConnection) {
      //  if(params.userId.includes("members")){
      //    console.log("check user id" , params.userId);
      //    console.log("check after remove members user id" , params.userId.replace("members",""));
      //  }

      // Emit event to mark messages as seen
      socketConnection.emit('seen', params.userId);

      // Set up socket listeners
      socketConnection.emit('message-page', params.userId);

      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });

      socketConnection.on('message', (data) => {

        setAllMessage(data);
      });

      socketConnection.on('group:message', (data) => {

        setAllMessageGroup(data);

      });
      // Listen for incoming calls (ensure this is only in MessagePage.js)
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
    }
  }, [socketConnection, params.userId, user]);


  const handleRejectCall = () => {
    setShowIncomingCallModal(false);
    if (callTimeout) {
      clearTimeout(callTimeout); // Clear the timeout
    }
    // Emit call rejection event to the caller
    socketConnection.emit('call-rejected', { callerId: callerInfo?.callerId, receiverId: user._id });
  };

  const handleAcceptCall = () => {
    setShowIncomingCallModal(false);
    if (callTimeout) {
      clearTimeout(callTimeout); // Clear the timeout
    }
    const roomId = callerInfo?.roomId;
    socketConnection.emit('accept-call', { roomId, callerId: callerInfo?.callerId, receiverId: user._id });
    window.open(`https://cadprouk.com/join?room=${roomId}`, "_blank");
  };


  const handleOnChange = (e) => {
    const { name, value } = e.target

    setMessage(preve => {
      return {
        ...preve,
        text: value
      }
    })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()


    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        if (dataUser?.type == "user") {
          socketConnection.emit('new message', {
            sender: user?._id,
            receiver: params.userId,
            text: message.text,
            imageUrl: message.imageUrl,
            videoUrl: message.videoUrl,
            msgByUserId: user?._id
          })
        } else {
          socketConnection.emit('new:group:message', {
            groupId: dataUser?._id,
            text: message.text,
            imageUrl: message.imageUrl,
            videoUrl: message.videoUrl,
            msgByUserId: user?._id
          })

        }
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: ""
        })

      }
    }
  }


  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='bg-no-repeat bg-cover'>
      <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
        <div className='flex items-center gap-4'>
          <Link to={"/"} className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
            <p className='-my-2 text-sm'>
              {dataUser?.type == "user" ?
                (dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-400'>offline</span>) : (dataUser?.members?.map((member) => (<span className='text-slate-400'>{member.name + ", "}</span>)))
              }
            </p>
          </div>
        </div>

        <div >
          <button onClick={handleShowCallModal} className='cursor-pointer hover:text-primary'>
            <IoMdCall size={20} />
          </button>
        </div>
      </header>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">Make a Call</h2>
            <p className="mb-6">Do you want to start a call with {dataUser.name}?</p>
            <button onClick={handleStartCall} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Start Call</button>
            <button onClick={handleCloseCallModal} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}

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



      {/***show all message */}
      <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50'>


        {/**all message show here */}
        <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
          {
            dataUser.type === "user" ? (
              allMessage.map((msg, index) => {
                return (
                  <div className={` p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === msg?.msgByUserId ? "ml-auto bg-teal-100" : "bg-white"}`}>
                    <div className='w-full relative'>
                      {
                        msg?.imageUrl && (
                          <img
                            src={msg?.imageUrl}
                            className='w-full h-full object-scale-down'
                          />
                        )
                      }
                      {
                        msg?.videoUrl && (
                          <video
                            src={msg.videoUrl}
                            className='w-full h-full object-scale-down'
                            controls
                          />
                        )
                      }
                    </div>
                    <div className="flex items-center justify-between px-2">
                      <p className="flex-1">{msg.text}</p>
                      <p className="text-xs ml-2">{moment(msg.createdAt).format('hh:mm')}</p>                      
                      {user._id === msg?.msgByUserId ? msg?.seen ? <TiTick className="text-blue-500" size={12} /> : <TiTick className="text-grey-500" size={12} /> : "" }
                    </div>

                  </div>
                )
              })
            ) : (
              allMessageGroup?.map((msg, index) => {
                return (
                  <div className={` p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === msg?.msgByUserId._id ? "ml-auto bg-teal-100" : "bg-white"}`}>
                    <div className='w-full relative'>
                      {
                        msg?.imageUrl && (
                          <img
                            src={msg?.imageUrl}
                            className='w-full h-full object-scale-down'
                          />
                        )
                      }
                      {
                        msg?.videoUrl && (
                          <video
                            src={msg.videoUrl}
                            className='w-full h-full object-scale-down'
                            controls
                          />
                        )
                      }
                    </div>
                    <div className="flex items-start p-2">
  {/* Avatar Section */}
  <div className="flex items-center justify-center h-full">
    <Avatar
      width={40}
      height={40}
      name={msg.msgByUserId.name}
      imageUrl={msg?.msgByUserId.profile_pic}
      userId={msg?.msgByUserId._id}
    />
  </div>

  {/* Message Content Section */}
  <div className="flex flex-col ml-2 w-full">
    {/* User Name */}
    <p className="text-sm font-medium text-green-700 text-nowrap">{msg.msgByUserId.name}</p>

    {/* Message Text */}
    <p className="text-base text-gray-800">{msg.text}</p>
  </div>

  {/* Timestamp and Tick Icon */}
  <div className="flex flex- ml-2 items-end justify-between text-nowrap">
    <p className="text-xs text-gray-500">{moment(msg.createdAt).format('hh:mm A')}</p>
    {user._id === msg?.msgByUserId._id ? msg?.seen ? <TiTick className="text-blue-500" size={12} /> : <TiTick className="text-gray-500" size={12} /> : ""}
  </div>
</div>

                  </div>
                )
              })
            )
          }

        </div>


        {/**upload Image display */}
        {
          message.imageUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadImage}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3'>
                <img
                  src={message.imageUrl}
                  alt='uploadImage'
                  className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                />
              </div>
            </div>
          )
        }

        {/**upload video display */}
        {
          message.videoUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadVideo}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3'>
                <video
                  src={message.videoUrl}
                  className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                  controls
                  muted
                  autoPlay
                />
              </div>
            </div>
          )
        }

        {
          loading && (
            <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
              <Loading />
            </div>
          )
        }
      </section>

      {/**send message */}
      <section className='h-16 bg-white flex items-center px-4'>
        <div className='relative '>
          <button onClick={handleUploadImageVideoOpen} className='flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white'>
            <FaPlus size={20} />
          </button>

          {/**video and image */}
          {
            openImageVideoUpload && (
              <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2'>
                <form>
                  <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                    <div className='text-primary'>
                      <FaImage size={18} />
                    </div>
                    <p>Image</p>
                  </label>
                  <label htmlFor='uploadVideo' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                    <div className='text-purple-500'>
                      <FaVideo size={18} />
                    </div>
                    <p>Video</p>
                  </label>

                  <input
                    type='file'
                    id='uploadImage'
                    onChange={handleUploadImage}
                    className='hidden'
                  />

                  <input
                    type='file'
                    id='uploadVideo'
                    onChange={handleUploadVideo}
                    className='hidden'
                  />
                </form>
              </div>
            )
          }

        </div>

        {/**input box */}
        <form className='h-full w-full flex gap-2' onSubmit={handleSendMessage}>
          <input
            type='text'
            placeholder='Type here message...'
            className='py-1 px-4 outline-none w-full h-full'
            value={message.text}
            onChange={handleOnChange}
          />
          <button className='text-primary hover:text-secondary'>
            <IoMdSend size={28} />
          </button>
        </form>

      </section>



    </div>
  )
}

export default MessagePage
