import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from '../configureStore';
import { Landing } from '../pages/Landing';
import { Dashboard } from '../pages/Dashboard';

export const Router = () => (
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                {/* v6: `component` prop replaced by `element` which takes a JSX element */}
                <Route path='/' element={<Landing />} />
                <Route path='/dashboard' element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    </Provider>
);