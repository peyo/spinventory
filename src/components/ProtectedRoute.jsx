import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { CircularProgress, Container } from '@mui/material';
import PropTypes from 'prop-types';
import API_URL from '../config/config';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    // Fetch user role
                    const response = await fetch(
                        `${API_URL}/api/user/${currentUser.uid}?requestingUser=${currentUser.email}`
                    );
                    if (!response.ok) {
                        throw new Error('Failed to fetch user role');
                    }
                    const data = await response.json();
                    setUserRole(data.role);
                } catch (error) {
                    console.error('Error fetching user role:', error);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#007AFF' }} />
            </Container>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Check if user has the required role
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // If user doesn't have the required role, redirect based on their role
        if (userRole === 'admin') {
            return <Navigate to="/user-management" replace />;
        } else if (userRole === 'accountant') {
            return <Navigate to="/accounting" replace />;
        } else {
            return <Navigate to="/tally" replace />;
        }
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute; 