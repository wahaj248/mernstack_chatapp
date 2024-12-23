import React, { useContext, useEffect, useState } from 'react'
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import Avatar from './Avatar'
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from './SearchUser';
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { logout } from '../redux/userSlice';
import { MdGroups } from "react-icons/md";
import SearchGroup from './SearchGroup';
import myContext from '../context/myContext';
import Loading from './Loading';

const Sidebar = () => {
    const user = useSelector(state => state?.user)
    const [editUserOpen, setEditUserOpen] = useState(false)
    const [allUser, setAllUser] = useState([])
    const [openSearchUser, setOpenSearchUser] = useState(false)
    const [openGroupUser, setOpenGroupUser] = useState(false)
    const [openSearchGroupUser, setOpenSearchGroupUser] = useState(false)
      const [loading, setloading] = useState(false)
    
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const context = useContext(myContext);
  
  const {  socketConnection  } = context;


    useEffect(() => {
        if (socketConnection) {
            setloading(true);
            socketConnection.emit('sidebar', user._id)
            socketConnection.on("group:conversation" , (data)=> console.log("data grp" , data));
            
            socketConnection.on('conversation', (data) => {

                const conversationUserData = data.map((conversationUser, index) => {
                    if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser?.sender
                        }
                    }
                    else if (conversationUser?.receiver?._id !== user?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.receiver
                        }
                    } else {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.sender
                        }
                    }
                })

                setAllUser(conversationUserData)
                setloading(false);
            })
        }

    }, [socketConnection, user])

    const handleLogout = () => {
        dispatch(logout())
        navigate("/email")
        localStorage.clear()
    }


    return (
        <div className='w-full h-full grid grid-cols-[48px,1fr] bg-white'>
            <div className='bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between'>
                <div>
                    <NavLink className={({ isActive }) => `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${isActive && "bg-slate-200"}`} title='Chat'>
                        <IoChatbubbleEllipses
                            size={20}
                        />
                    </NavLink>

                    <div title='Add friend' onClick={() => setOpenSearchUser(true)} className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' >
                        <FaUserPlus size={20} />
                    </div>
                    <div title='Add Group' onClick={() => setOpenSearchGroupUser(true)} className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' >
                        <FaUserGroup size={20} />
                    </div>
                    <div title='Create Group' onClick={() => setOpenGroupUser(true)} className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' >
                        <MdGroups size={30} />
                    </div>
                </div>

                <div className='flex flex-col items-center'>
                    <button className='mx-auto' title={user?.name} onClick={() => setEditUserOpen(true)}>
                        <Avatar
                            width={40}
                            height={40}
                            name={user?.name}
                            imageUrl={user?.profile_pic}
                            userId={user?._id}
                        />
                    </button>
                    <button title='logout' className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' onClick={handleLogout}>
                        <span className='-ml-2'>
                            <BiLogOut size={20} />
                        </span>
                    </button>
                </div>
            </div>

            <div className='w-full'>
                <div className='h-16 flex items-center'>
                    <h2 className='text-xl font-bold p-4 text-slate-800'>Message</h2>
                </div>
                <div className='bg-slate-200 p-[0.5px]'></div>

                <div className=' h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'>
                    {loading && (
                        <div className='flex justify-center items-center h-screen'><Loading /> </div>
                    )}
                    {
                        allUser.length === 0 && (
                            <div className='mt-12'>
                                <div className='flex justify-center items-center my-4 text-slate-500'>
                                    <FiArrowUpLeft
                                        size={50}
                                    />
                                </div>
                                <p className='text-lg text-center text-slate-400'>Explore users to start a conversation with.</p>
                            </div>
                        )
                    }

                    {
                        allUser.map((conv, index) => {
                            if (!conv || !conv?.userDetails?._id || conv.type === "group") return null;
                            return (
                                <>
                                    <NavLink
                                        to={"/" + conv?.userDetails?._id}
                                        key={conv?._id}
                                        className='flex items-center gap-2 py-3 px-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer'
                                        onClick={() => {
                                            if (socketConnection) {
                                                conv.unseenMsg = 0;
                                                socketConnection.emit('seen', {
                                                    conversationId: conv?.userDetails?._id,
                                                    conversationType: "user"
                                                });
                                            }
                                        }}
                                    >
                                        <div>
                                            <Avatar
                                                imageUrl={conv?.userDetails?.profile_pic}
                                                name={conv?.userDetails?.name}
                                                width={40}
                                                height={40}
                                            />
                                        </div>
                                        <div>
                                            <h3 className='text-ellipsis line-clamp-1 font-semibold text-base'>{conv?.userDetails?.name}</h3>
                                            <div className='text-slate-500 text-xs flex items-center gap-1'>
                                                <div className='flex items-center gap-1'>
                                                    {
                                                        conv?.lastMsg?.imageUrl && (
                                                            <div className='flex items-center gap-1'>
                                                                <span><FaImage /></span>
                                                                {!conv?.lastMsg?.text && <span>Image</span>}
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        conv?.lastMsg?.videoUrl && (
                                                            <div className='flex items-center gap-1'>
                                                                <span><FaVideo /></span>
                                                                {!conv?.lastMsg?.text && <span>Video</span>}
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                                <p className='text-ellipsis line-clamp-1'>{conv?.lastMsg?.text}</p>
                                            </div>
                                        </div>
                                        {
                                            Boolean(conv?.unseenMsg) && (
                                                <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full'>{conv?.unseenMsg}</p>
                                            )
                                        }
                                    </NavLink>
                                </>
                            )
                        })
                    }
                    <h3 className='text-lg font-bold px-4 mb-2 text-slate-800'>Groups</h3>
                    {
                        allUser.map((conv, index) => {
                            if (!conv || !conv?.members || conv.type === "user") return null;
                            return (
                                <>
                                    <NavLink
                                        to={"/" + conv?._id}
                                        key={conv?._id}
                                        className='flex items-center gap-2 py-3 px-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer'
                                        onClick={() => {
                                            console.log("convoo of grp" , conv);
                                            
                                            if (socketConnection) {
                                                conv.unseenMsg = 0;
                                                socketConnection.emit('seen', {
                                                    conversationId: conv?._id,
                                                    conversationType: "group"
                                                });
                                            }
                                        }}
                                    >
                                        <div>
                                            <Avatar
                                                imageUrl={conv?.profile_pic}
                                                name={conv?.name}
                                                width={40}
                                                height={40}
                                            />
                                        </div>
                                        <div>
                                            <h3 className='text-ellipsis line-clamp-1 font-semibold text-base'>{conv?.name}</h3>
                                            <div className='text-slate-500 text-xs flex items-center gap-1'>
                                                <div className='flex items-center gap-1'>
                                                    {
                                                        conv?.lastMsg?.imageUrl && (
                                                            <div className='flex items-center gap-1'>
                                                                <span><FaImage /></span>
                                                                {!conv?.lastMsg?.text && <span>Image</span>}
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        conv?.lastMsg?.videoUrl && (
                                                            <div className='flex items-center gap-1'>
                                                                <span><FaVideo /></span>
                                                                {!conv?.lastMsg?.text && <span>Video</span>}
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                                <p className='text-ellipsis line-clamp-1'>{conv?.lastMsg?.msgByUserId?.name}: {conv?.lastMsg?.text}</p>
                                            </div>
                                        </div>
                                        {
                                            Boolean(conv?.unseenMsg) && (
                                                <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full'>{conv?.unseenMsg}</p>
                                            )
                                        }
                                    </NavLink>
                                </>
                            )
                        })
                    }

                    {/* Groups Section */}

                </div>
            </div>


            {/**edit user details*/}
            {
                editUserOpen && (
                    <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />
                )
            }

            {/**search user */}
            {
                openSearchUser && (
                    <SearchUser onClose={() => setOpenSearchUser(false)} />
                )
            }
            {/**search group */}
            {
                openSearchGroupUser && (
                    <SearchGroup onClose={() => setOpenSearchGroupUser(false)} />
                )
            }
            {/**create group user */}
            {
                openGroupUser && (
                    <SearchUser isGroup={true} onClose={() => setOpenGroupUser(false)} />
                )
            }

        </div>
    )
}

export default Sidebar
