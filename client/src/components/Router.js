import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { store } from '../configureStore';
import { Landing } from '../pages/Landing';
import { Dashboard } from '../pages/Dashboard';
import { getAuthStatus } from '../utils/API';
import { login } from '../actions/actionCreators';

// Checks Redux auth state and redirects unauthenticated users to /
// Must be used to wrap any route that requires authentication
const ProtectedRoute = ({ children }) => {
    const user = useSelector((state) => state.user);
    if (!user) return <Navigate to='/' replace />;
    return children;
};

// Separate component so useDispatch can access the Provider store above it
const AppRoutes = () => {
    const dispatch = useDispatch();

    // Rehydrate Redux auth state from server session on page refresh.
    // Without this, a logged-in user who refreshes the page will have
    // state.user = null and be redirected to / by ProtectedRoute.
    useEffect(() => {
        getAuthStatus().then(({ user }) => {
            if (user) dispatch(login(user));
        });
    }, [dispatch]);

    return (
        <Routes>
            <Route path='/' element={<Landing />} />
            <Route
                path='/dashboard'
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export const Router = () => (
    <Provider store={store}>
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    </Provider>
);