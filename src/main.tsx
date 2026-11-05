import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import { ToastProvider } from './components/ui'
import Landing from './pages/Landing'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Barbers from './pages/admin/Barbers'
import Services from './pages/admin/Services'
import WorkingHoursPage from './pages/admin/WorkingHours'
import Users from './pages/admin/Users'
import ChangePassword from './pages/admin/ChangePassword'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Respect the OS "reduce motion" setting for every Framer Motion animation */}
    <MotionConfig reducedMotion="user">
      <AppStoreProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="barbeiros" element={<Barbers />} />
                <Route path="servicos" element={<Services />} />
                <Route path="horarios" element={<WorkingHoursPage />} />
                <Route path="usuarios" element={<Users />} />
                <Route path="trocar-senha" element={<ChangePassword />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppStoreProvider>
    </MotionConfig>
  </StrictMode>,
)
