import React, { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ onClose, onCreateGroup }) => {
    const [groupName, setGroupName] = useState('');
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch users to display as possible group members
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/search-user`);
                setMembers(response.data.data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                toast.error("Failed to load users");
            }
        };

        fetchUsers();
    }, []);

    const handleCreateGroup = () => {
        if (!groupName || selectedMembers.length === 0) {
            toast.error("Please provide a group name and select at least one member.");
            return;
        }

        const groupData = {
            name: groupName,
            members: selectedMembers,
        };

        onCreateGroup(groupData);
        onClose();
    };

    const toggleMemberSelection = (userId) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-xl">
                    <IoClose />
                </button>
                <h2 className="text-2xl font-semibold mb-4">Create Group</h2>

                <div className="mb-4">
                    <label className="block font-medium">Group Name</label>
                    <input
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full mt-1 p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-medium mb-2">Select Members</label>
                    <div className="max-h-40 overflow-y-auto border p-2 rounded">
                        {loading && <p>Loading users...</p>}
                        {!loading && members.length === 0 && <p>No users available.</p>}
                        {members.map((user) => (
                            <div key={user._id} className="flex items-center space-x-2 mb-2">
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(user._id)}
                                    onChange={() => toggleMemberSelection(user._id)}
                                />
                                <span>{user.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleCreateGroup}
                    className="bg-blue-500 text-white p-2 rounded w-full"
                >
                    Add Members
                </button>
            </div>
        </div>
    );
};

export default CreateGroupModal;
