import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { UserProvider } from './context/UserContext';
import { AdminLayout } from './components/AdminLayout';
import { SuperAdminLayout } from './components/SuperAdminLayout';

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const ManageNeeds = lazy(() => import('./pages/ManageNeeds').then((m) => ({ default: m.ManageNeeds })));
const FeedManagement = lazy(() => import('./pages/FeedManagement').then((m) => ({ default: m.FeedManagement })));
const ManageGallery = lazy(() => import('./pages/ManageGallery').then((m) => ({ default: m.ManageGallery })));
const ManageSchemes = lazy(() => import('./pages/ManageSchemes').then((m) => ({ default: m.ManageSchemes })));
const ManageEvents = lazy(() => import('./pages/ManageEvents').then((m) => ({ default: m.ManageEvents })));
const CreateEvent = lazy(() => import('./pages/CreateEvent').then((m) => ({ default: m.CreateEvent })));
const EventBookings = lazy(() => import('./pages/EventBookings').then((m) => ({ default: m.EventBookings })));
const ManageBookings = lazy(() => import('./pages/ManageBookings').then((m) => ({ default: m.ManageBookings })));
const ManageChildren = lazy(() => import('./pages/ManageChildren').then((m) => ({ default: m.ManageChildren })));
const ManageTeam = lazy(() => import('./pages/ManageTeam').then((m) => ({ default: m.ManageTeam })));
const ManageUsers = lazy(() => import('./pages/ManageUsers').then((m) => ({ default: m.ManageUsers })));
const AdminSettings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard').then((m) => ({ default: m.SuperAdminDashboard })));

function LoadingFallback() {
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex items-center gap-3 text-[#0F6D4E] font-bold">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0F6D4E] border-t-transparent" />
        Loading Portal Module...
      </div>
    </div>
  );
}

export function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Default Redirect to Admin Dashboard */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* ──── ADMIN PANEL ROUTES (Screenshot 2) ──── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>} />
            <Route path="needs" element={<Suspense fallback={<LoadingFallback />}><ManageNeeds /></Suspense>} />
            <Route path="feed" element={<Suspense fallback={<LoadingFallback />}><FeedManagement /></Suspense>} />
            <Route path="gallery" element={<Suspense fallback={<LoadingFallback />}><ManageGallery /></Suspense>} />
            <Route path="schemes" element={<Suspense fallback={<LoadingFallback />}><ManageSchemes /></Suspense>} />
            <Route path="events" element={<Suspense fallback={<LoadingFallback />}><ManageEvents /></Suspense>} />
            <Route path="events/create" element={<Suspense fallback={<LoadingFallback />}><CreateEvent /></Suspense>} />
            <Route path="events/bookings/:id" element={<Suspense fallback={<LoadingFallback />}><EventBookings /></Suspense>} />
            <Route path="bookings" element={<Suspense fallback={<LoadingFallback />}><ManageBookings /></Suspense>} />
            <Route path="children" element={<Suspense fallback={<LoadingFallback />}><ManageChildren /></Suspense>} />
            <Route path="team" element={<Suspense fallback={<LoadingFallback />}><ManageTeam /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<LoadingFallback />}><ManageUsers /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><AdminSettings /></Suspense>} />
          </Route>

          {/* ──── SUPER ADMIN PANEL ROUTES (Screenshot 1) ──── */}
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="health" /></Suspense>} />
            <Route path="media" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="media" /></Suspense>} />
            <Route path="hero" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="hero" /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<LoadingFallback />}><ManageUsers /></Suspense>} />
            <Route path="ads" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="ads" /></Suspense>} />
            <Route path="logs" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="logs" /></Suspense>} />
            <Route path="configs" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="configs" /></Suspense>} />
            <Route path="backup" element={<Suspense fallback={<LoadingFallback />}><SuperAdminDashboard activeTab="backup" /></Suspense>} />
          </Route>

          {/* ──── 404 NOT FOUND ANIMATED PAGE ──── */}
          <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
