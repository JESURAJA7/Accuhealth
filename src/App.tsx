import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Masters from './pages/Masters/Masters';
import UserManagement from './pages/UserManagement';
import Notifications from './pages/Notification/Notifications';
import MalariaListing from './pages/Notification/MalariaListing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import VaccinationListing from './pages/Vaccination/VaccinationListing';
import VaccinReport from './pages/Vaccination/VaccinReport';
import VaccinationReport from './pages/Reporting/VaccinationReport';
import MalariaReport from './pages/Reporting/MalariaReport';
import NotificationEntry from './pages/Notification/NotificationEntry';
import VaccinationEntry from './pages/Vaccination/VaccinationEntry';
import Role from './pages/Masters/role_1';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/notification-entry" element={<NotificationEntry />} />
            <Route path="/vaccination-entry" element={<VaccinationEntry />} />
            <Route path="/role-1" element={<Role />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/masters" element={
              <ProtectedRoute>
                <Layout>
                  <Masters />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/user-management" element={
              <ProtectedRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/malaria-listing" element={
              <ProtectedRoute>
                <Layout>
                  <MalariaListing />
                </Layout>
              </ProtectedRoute>
            } />
              <Route path="/vaccination-report" element={
              <ProtectedRoute>
                <Layout>
                  <VaccinationReport />
                </Layout>
              </ProtectedRoute>
            } />
               <Route path="/malaria-report" element={
              <ProtectedRoute>
                <Layout>
                  <MalariaReport />
                </Layout>
              </ProtectedRoute>
            } />
              
             <Route path="/vaccin-report" element={
              <ProtectedRoute>
                <Layout>
                  <VaccinReport />
                </Layout>
              </ProtectedRoute>
            } />

              <Route path="/vaccination-listing" element={
              <ProtectedRoute>
                <Layout>
                  <VaccinationListing />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          {/* <Route path="/notification-entry" element={
            <ProtectedRoute>
              <Layout>
                <NotificationEntry />
              </Layout>
            </ProtectedRoute>
          } /> */}

           
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;