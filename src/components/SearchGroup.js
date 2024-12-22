import React, { useEffect, useState } from 'react';
import { IoSearchOutline, IoClose } from "react-icons/io5";
import Loading from './Loading';
import toast from 'react-hot-toast';
import axios from 'axios';
import UserSearchCard from './UserSearchCard';
import { BASE_URL } from '../pages/BaseUrl';
import axiosFetch from '../axios';

const SearchGroup = ({ onClose }) => {
    const [groups, setGroups] = useState([]);
    const [search, setSearch] = useState(""); // Single state for search input
    const [loading, setLoading] = useState(false);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await axiosFetch(`${BASE_URL}/api/groups`);
            setGroups(response.data.groups || []);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching groups:', error);
            toast.error('Failed to fetch groups.');
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // Filter groups directly in the render
    const filteredGroups = groups.filter((group) =>
        group.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10'>
            <div className='w-full max-w-lg mx-auto mt-10'>
                {/** Input for searching groups */}
                <div className='bg-white rounded h-14 overflow-hidden flex'>
                    <input
                        type='text'
                        placeholder='Search group by name...'
                        className='w-full outline-none py-1 h-full px-4'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className='h-14 w-14 flex justify-center items-center'>
                        <IoSearchOutline size={25} />
                    </div>
                </div>

                {/** Display groups */}
                <div
                    className='bg-white mt-2 w-full p-4 rounded'
                    style={{
                        maxHeight: '400px', // Limit height for scroll
                        overflowY: 'auto', // Add vertical scroll
                        scrollbarWidth: 'thin', // For Firefox
                    }}
                >
                    <div
                        style={{
                            overflowY: 'auto',
                            scrollbarWidth: 'thin', // Thinner scrollbar for Firefox
                        }}
                    >
                        {loading && <Loading />}
                        {!loading && filteredGroups.length === 0 && (
                            <p className='text-center text-slate-500'>No groups found!</p>
                        )}
                        {!loading && filteredGroups.length !== 0 && (
                            filteredGroups.map((group) => (
                                <UserSearchCard key={group._id} user={group} onClose={onClose} />
                            ))
                        )}
                    </div>
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

export default SearchGroup;
