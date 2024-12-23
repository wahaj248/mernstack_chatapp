import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children }) {
    const token = useSelector(state => state?.user?.token);
    const navigate = useNavigate();
useEffect(() => {
     if (!token) {
        navigate('/email');
    }
    }, [navigate , token]);

    return children;
}

export default ProtectedRoute;
