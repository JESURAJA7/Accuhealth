import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Masters from './pages/Masters/Masters';
import UserManagement from './pages/UserManagement';
import Notifications from './pages/Notification/Notifications';
import MalariaListing from './pages/Notification/MalariaListing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import VaccinationListing from './pages/Vaccination/VaccinationListing';
import VaccinReport from './pages/Vaccination/VaccinReport';
import VaccinationReport from './pages/Reporting/VaccinationReport';
import MalariaReport from './pages/Reporting/MalariaReport';
import NotificationEntry from './pages/Notification/NotificationEntry';
import VaccinationEntry from './pages/Vaccination/VaccinationEntry';
import Role from './pages/Masters/Roles';
import TBNotification from './pages/TB/TBNotification';
import TBListing from './pages/TB/TBListing';
import TBScreening from './pages/TB/TBScreening';
import FeverRashEntry from './pages/Fever&Rash/FeverRashEntry';
import ARIListing from './pages/ARI/ARIListing';
import ARINotification from './pages/ARI/ARINotification';
import PolioCaseListing from './pages/Polio/PolioCaseListing';
import PolioInvestigation from './pages/Polio/PolioInvestigation';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/masters"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Masters />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/malaria-notification"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/malaria-listing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MalariaListing />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vaccination-report"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VaccinationReport />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/malaria-report"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MalariaReport />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vaccin-report"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VaccinReport />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vaccination-listing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VaccinationListing />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification-entry"
              element={<NotificationEntry />}
            />
            <Route
              path="/vaccination-entry"
              element={<VaccinationEntry />}
            />
            <Route
              path="/roles"
              element={
                <Layout>
                  <Role />
                </Layout>
              }
            />

            {/* TB Routes (moved inside Routes) */}
            <Route
              path="/tb-notification"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TBNotification />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tb-listing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TBListing />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tb-screening"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TBScreening />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Fever & rash Routes */}
            <Route
              path="/fever-rash-entry"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FeverRashEntry />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* ARI Routes */}
            <Route
              path="/ari-listing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ARIListing />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ari-notification"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ARINotification />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Polio Routes */}
            <Route
              path="/polio-case-listing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PolioCaseListing />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/polio-investigation"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PolioInvestigation />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
