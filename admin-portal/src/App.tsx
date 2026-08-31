// Niswartha Developer Super Admin Portal Core Routing App
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { UserProvider } from './context/UserContext';
import { AdminLayout } from './components/AdminLayout';
import { ThemePaletteStudio } from './components/ThemePaletteStudio';

// Lazy SuperAdmin Console Pages
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const ManageUsers = lazy(() => import('./pages/ManageUsers').then(m => ({ default: m.ManageUsers })));

function LoadingFallback() {
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex items-center gap-3 text-[#0F6D4E] font-bold">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0F6D4E] border-t-transparent" />
        Loading Super Admin Console...
      </div>
    </div>
  );
}

export function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            {/* Super Admin Developer Modules */}
            <Route index element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="health" /></Suspense>} />
            <Route path="theme-studio" element={<ThemePaletteStudio />} />
            <Route path="hero-manager" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="hero" /></Suspense>} />
            <Route path="media-library" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="media" /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<LoadingFallback />}><ManageUsers /></Suspense>} />
            <Route path="ads" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="ads" /></Suspense>} />
            <Route path="audit-logs" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="logs" /></Suspense>} />
            <Route path="badges" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="badges" /></Suspense>} />
            <Route path="configs" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="configs" /></Suspense>} />
            <Route path="backup" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="backup" /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
