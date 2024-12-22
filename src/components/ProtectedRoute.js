import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useSelector } from 'react-redux';

function ProtectedRoute({ children }) {
    const userToken = useSelector(state => state?.user)
    const navigate = useNavigate();
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));

    useEffect(() => {
        
     if (token) {
         console.log("check token" , document.cookie);
         console.log("check token with redux" ,userToken);
            const jwtToken = token.split('=')[1];
            const decodedToken = jwtDecode(jwtToken);

            if (decodedToken.exp * 1000 < Date.now()) {
                navigate('/email'); // Redirect to email page if token expired
            }
        } else {
            navigate('/email'); // Redirect if token does not exist
        }
    }, [navigate , token]);

    return children;
}

export default ProtectedRoute;
