import React, { useEffect } from 'react';
import logo from '../assets/logo.jpg';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AuthLayouts = ({ children }) => {
      const navigate = useNavigate();
  const userToken = useSelector(state => state?.user?.token);
  useEffect(() => {
    if (userToken) {
      navigate(-1);
    }

  }, [ navigate])
  
  
  return (
    <>
      <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white rounded-lg'>
        <div className='flex items-center space-x-4'>

        </div>
      </header>

      {children}
    </>
  );
};

export default AuthLayouts;
