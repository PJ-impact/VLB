import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { KioskPage } from './pages/KioskPage';
import{LoginPage } from './pages/LoginPage'
import{DashboardPage} from './pages/DashboardPage'
import{HistoryPage} from './pages/HistoryPage'
import { RegisterPage } from './pages/Registerpage';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Kiosk Route */}
          <Route path="/" element={<KioskPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Receptionist & Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['receptionist', 'admin']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Admin Only Route */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;