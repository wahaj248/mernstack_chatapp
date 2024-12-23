import React, { useState } from 'react';
import Avatar from './Avatar';
import { Link } from 'react-router-dom';

const UserSearchCard = ({ user, onClose, onSelectUser , isGroup}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    onSelectUser(user?._id, checked); 
  };

  return (
    <div className='flex items-center gap-3 p-2 lg:p-4 border border-transparent border-b-slate-200 hover:border hover:border-primary rounded cursor-pointer'>
      {isGroup && <input
        type='checkbox'
        checked={isChecked}
        onChange={handleCheckboxChange}
        className='w-5 h-5'
      />}
      <div>
        <Avatar
          width={50}
          height={50}
          name={user?.name}
          userId={user?._id}
          imageUrl={user?.profile_pic}
        />
      </div>
      <div>
        <div className='font-semibold text-ellipsis line-clamp-1'>
          {user?.name}
        </div>
        <p className='text-sm text-ellipsis line-clamp-1'>{user?.email}</p>
      </div>
      {!isGroup && <Link to={'/' + user?._id} onClick={onClose} className='ml-auto'>
        Message
      </Link>}
    </div>
  );
};

export default UserSearchCard;
