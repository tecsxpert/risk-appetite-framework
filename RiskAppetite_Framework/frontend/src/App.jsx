import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RiskList from './pages/RiskList';
import RiskDetail from './pages/RiskDetail';
import RiskForm from './pages/RiskForm';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="risks" element={<RiskList />} />
              <Route path="risks/new" element={<RiskForm />} />
              <Route path="risks/:id" element={<RiskDetail />} />
              <Route path="risks/:id/edit" element={<RiskForm />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>

    </ErrorBoundary>
  );
}

export default App;