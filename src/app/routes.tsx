import { createBrowserRouter } from 'react-router';
import { Layout } from './layout';
import { Home } from './pages/Home';
import { AshramDetail } from './pages/AshramDetail';
import { Donation } from './pages/Donation';
import { DonationFlow } from './pages/DonationFlow';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';
import { Needs } from './pages/Needs';
import { Events } from './pages/Events';
import { SuggestEvent } from './pages/SuggestEvent';
import { EventBooking } from './pages/EventBooking';
import { VisitBooking } from './pages/VisitBooking';
import { MyBookings } from './pages/MyBookings';
import { DonationHistory } from './pages/DonationHistory';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { About } from './pages/About';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageNeeds } from './pages/admin/ManageNeeds';
import { ManageEvents } from './pages/admin/ManageEvents';
import { CreateEvent } from './pages/admin/CreateEvent';
import { FeedManagement } from './pages/admin/FeedManagement';
import { Settings as AdminSettings } from './pages/admin/Settings';
import { ManageAshrams } from './pages/admin/ManageAshrams';
import { CreateAshram } from './pages/admin/CreateAshram';
import { EventBookings } from './pages/admin/EventBookings';
import { NotFound } from './pages/NotFound';
import { UserProvider, useUser } from './context/UserContext';
import { Navigate } from 'react-router';

// New layout and pages imports
import { AdminLayout } from './components/AdminLayout';
import { GalleryPage } from './pages/GalleryPage';
import { SchemesPage } from './pages/SchemesPage';
import { ManageGallery } from './pages/admin/ManageGallery';
import { ManageSchemes } from './pages/admin/ManageSchemes';
import { ManageChildren } from './pages/admin/ManageChildren';
import { ManageTeam } from './pages/admin/ManageTeam';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageBookings } from './pages/admin/ManageBookings';

// Wrapper component to provide UserContext to all routes
function RootLayout({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, isAdmin } = useUser();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout><Layout /></RootLayout>,
    children: [
      // Public pages
      { index: true, path: '/', element: <Home /> },
      { path: 'about', Component: About },
      { path: 'help', Component: Help },
      { path: 'events', element: <Events /> },
      { path: 'needs', element: <Needs /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'schemes', element: <SchemesPage /> },

      // Protected pages
      { path: 'events/suggest', element: <ProtectedRoute><SuggestEvent /></ProtectedRoute> },
      { path: 'events/book/:id', element: <ProtectedRoute><EventBooking /></ProtectedRoute> },
      { path: 'visit-book/:ashramId', element: <ProtectedRoute><VisitBooking /></ProtectedRoute> },
      { path: 'donate/:id', element: <ProtectedRoute><Donation /></ProtectedRoute> },
      { path: 'donate-flow/:ashramId/:needId', element: <ProtectedRoute><DonationFlow /></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: 'my-bookings', element: <ProtectedRoute><MyBookings /></ProtectedRoute> },
      { path: 'donation-history', element: <ProtectedRoute><DonationHistory /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute><Settings /></ProtectedRoute> },

      // Admin routes wrapped in AdminLayout
      {
        path: 'admin',
        element: <AdminRoute><AdminLayout /></AdminRoute>,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'needs', element: <ManageNeeds /> },
          { path: 'events', element: <ManageEvents /> },
          { path: 'events/bookings/:id', element: <EventBookings /> },
          { path: 'events/create', element: <CreateEvent /> },
          { path: 'feed', element: <FeedManagement /> },
          { path: 'settings', element: <AdminSettings /> },
          { path: 'gallery', element: <ManageGallery /> },
          { path: 'schemes', element: <ManageSchemes /> },
          { path: 'children', element: <ManageChildren /> },
          { path: 'team', element: <ManageTeam /> },
          { path: 'users', element: <ManageUsers /> },
          { path: 'bookings', element: <ManageBookings /> },
        ],
      },

      { path: '*', Component: NotFound },
    ],
  },
  {
    path: '/login',
    element: <RootLayout><Layout /></RootLayout>,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: '/onboarding',
    element: <RootLayout><Layout /></RootLayout>,
    children: [{ index: true, element: <Onboarding /> }],
  },
  {
    path: '/signup',
    element: <RootLayout><Layout /></RootLayout>,
    children: [{ index: true, element: <Signup /> }],
  }
]);