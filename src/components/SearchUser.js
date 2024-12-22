import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
import toast from 'react-hot-toast';
import axios from 'axios';
import { IoClose } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { BASE_URL } from '../pages/BaseUrl';
import axiosFetch from '../axios';

const SearchUser = ({ onClose, isGroup }) => {
    const [searchUser, setSearchUser] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [name, setName] = useState(""); // State for group name input
    const currentUser = useSelector(state => state?.user)

    const handleSearchUser = async () => {
        const URL = `${BASE_URL}/api/search-user`;
        try {
            setLoading(true);
            const response = await axiosFetch(URL, {
                search: search
            } ,
        "POST");
            setLoading(false);
            const result = response.data.data;
            const filteredUsers = result.filter((user) => user._id !== currentUser?._id);
            setSearchUser(filteredUsers);
        } catch (error) {
            setLoading(false);
            toast.error(error?.response?.data?.message);
        }
    };

    const handleSelectUser = (userId, isSelected) => {
        setMembers((prev) =>
            isSelected ? [...prev, userId] : prev.filter((id) => id !== userId)
        );
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault()
        if (!name.trim()) {
            toast.error('Please enter a group name!');
            return;
        }
        if (members.length <= 1) {
            toast.error('Please select more than one user!');
            return;
        }
        const URL = `${BASE_URL}/api/create-group`;
        try {
            setLoading(true);
            const response = await axiosFetch( URL, {
                name,
                 members,
            } 
            , "POST",
        )
            toast.success(response?.data?.message);
            setLoading(false);
            onClose()
        } catch (error) {
            setLoading(false);
            toast.error(error?.message)
            onClose()
        }
    };


    useEffect(() => {
        handleSearchUser();
    }, [search]);



    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10'>
            <div className='w-full max-w-lg mx-auto mt-10'>
                {/**input search user */}
                <div className='bg-white rounded h-14 overflow-hidden flex '>
                    <input
                        type='text'
                        placeholder='Search user by name, email....'
                        className='w-full outline-none py-1 h-full px-4'
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                    <div className='h-14 w-14 flex justify-center items-center'>
                        <IoSearchOutline size={25} />
                    </div>
                </div>

                {/** Group name input (conditional) */}
                {isGroup && (
                    <div className='bg-white rounded h-14 overflow-hidden flex mt-2'>
                        <input
                            type='text'
                            placeholder='Enter group name...'
                            className='w-full outline-none py-1 h-full px-4'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                    </div>
                )}

                {/**display search user */}
                <div className='bg-white mt-2 w-full p-4 rounded'>
                    {/**no user found */}
                    {searchUser.length === 0 && !loading && (
                        <p className='text-center text-slate-500'>no user found!</p>
                    )}

                    {loading && (
                        <p><Loading /></p>
                    )}

                    {searchUser.length !== 0 && !loading && (
                        searchUser.map((user) => (
                            <UserSearchCard key={user._id} user={user} onClose={onClose} isGroup={isGroup} onSelectUser={handleSelectUser} />
                        ))
                    )}
                    {/** Create Group button */}
                    {isGroup && (
                        <div className='mt-4 text-center'>
                            <button
                                onClick={handleCreateGroup}
                                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'>
                                Create Group
                            </button>
                        </div>
                    )}
                </div>

            </div>

            <div className='absolute top-0 right-0 text-2xl p-2 lg:text-4xl hover:text-white' onClick={onClose}>
                <button>
                    <IoClose />
                </button>
            </div>
        </div>
    );
};

export default SearchUser;
