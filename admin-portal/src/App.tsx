import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { UserProvider } from './context/UserContext';
import { AdminLayout } from './components/AdminLayout';
import { ThemePaletteStudio } from './components/ThemePaletteStudio';

// Lazy Admin Pages (Loaded from local admin-portal/src/pages/)
const ManageEvents = lazy(() => import('./pages/ManageEvents').then(m => ({ default: m.ManageEvents })));
const CreateEvent = lazy(() => import('./pages/CreateEvent').then(m => ({ default: m.CreateEvent })));
const EventBookings = lazy(() => import('./pages/EventBookings').then(m => ({ default: m.EventBookings })));
const ManageNeeds = lazy(() => import('./pages/ManageNeeds').then(m => ({ default: m.ManageNeeds })));
const ManageGallery = lazy(() => import('./pages/ManageGallery').then(m => ({ default: m.ManageGallery })));
const ManageSchemes = lazy(() => import('./pages/ManageSchemes').then(m => ({ default: m.ManageSchemes })));
const ManageTeam = lazy(() => import('./pages/ManageTeam').then(m => ({ default: m.ManageTeam })));
const ManageChildren = lazy(() => import('./pages/ManageChildren').then(m => ({ default: m.ManageChildren })));
const ManageUsers = lazy(() => import('./pages/ManageUsers').then(m => ({ default: m.ManageUsers })));
const ManageBookings = lazy(() => import('./pages/ManageBookings').then(m => ({ default: m.ManageBookings })));
const FeedManagement = lazy(() => import('./pages/FeedManagement').then(m => ({ default: m.FeedManagement })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

function LoadingFallback() {
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex items-center gap-3 text-[#0F6D4E] font-bold">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0F6D4E] border-t-transparent" />
        Loading Admin Module...
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
            <Route index element={<ThemePaletteStudio />} />
            <Route path="events" element={<Suspense fallback={<LoadingFallback />}><ManageEvents /></Suspense>} />
            <Route path="events/create" element={<Suspense fallback={<LoadingFallback />}><CreateEvent /></Suspense>} />
            <Route path="events/bookings" element={<Suspense fallback={<LoadingFallback />}><EventBookings /></Suspense>} />
            <Route path="needs" element={<Suspense fallback={<LoadingFallback />}><ManageNeeds /></Suspense>} />
            <Route path="gallery" element={<Suspense fallback={<LoadingFallback />}><ManageGallery /></Suspense>} />
            <Route path="schemes" element={<Suspense fallback={<LoadingFallback />}><ManageSchemes /></Suspense>} />
            <Route path="team" element={<Suspense fallback={<LoadingFallback />}><ManageTeam /></Suspense>} />
            <Route path="children" element={<Suspense fallback={<LoadingFallback />}><ManageChildren /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<LoadingFallback />}><ManageUsers /></Suspense>} />
            <Route path="bookings" element={<Suspense fallback={<LoadingFallback />}><ManageBookings /></Suspense>} />
            <Route path="feed" element={<Suspense fallback={<LoadingFallback />}><FeedManagement /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><Settings /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
