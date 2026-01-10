
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LocationSelect from './pages/LocationSelect';
import Dashboard from './pages/Dashboard';
import ModelResults from './pages/ModelResults';

const queryClient = new QueryClient();

export default function AppRouter() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LocationSelect />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/model-results" element={<ModelResults />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
