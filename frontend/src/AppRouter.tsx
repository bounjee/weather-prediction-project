import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LocationSelect from './pages/LocationSelect';
import Dashboard from './pages/Dashboard';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LocationSelect />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
