import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToastProvider } from '@/context/ToastContext';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';

import HomePage from '@/pages/HomePage';
import MaterialsPage from '@/pages/MaterialsPage';
import MaterialDetailPage from '@/pages/MaterialDetailPage';
import RequestPage from '@/pages/RequestPage';
import RequestSuccessPage from '@/pages/RequestSuccessPage';
import RequestStatusPage from '@/pages/RequestStatusPage';
import AboutPage from '@/pages/AboutPage';
import GalleryPage from '@/pages/GalleryPage';
import VideosPage from '@/pages/VideosPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';

import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminRequestsPage from '@/pages/admin/AdminRequestsPage';
import AdminMaterialsPage from '@/pages/admin/AdminMaterialsPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminCustomersPage from '@/pages/admin/AdminCustomersPage';
import AdminGalleryPage from '@/pages/admin/AdminGalleryPage';
import AdminVideosPage from '@/pages/admin/AdminVideosPage';
import AdminContentPage from '@/pages/admin/AdminContentPage';
import AdminContactPage from '@/pages/admin/AdminContactPage';
import AdminLocationPage from '@/pages/admin/AdminLocationPage';
import AdminSEOPage from '@/pages/admin/AdminSEOPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="requests" element={<AdminRequestsPage />} />
                <Route path="materials" element={<AdminMaterialsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="gallery" element={<AdminGalleryPage />} />
                <Route path="videos" element={<AdminVideosPage />} />
                <Route path="content" element={<AdminContentPage />} />
                <Route path="contact" element={<AdminContactPage />} />
                <Route path="location" element={<AdminLocationPage />} />
                <Route path="seo" element={<AdminSEOPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Public routes */}
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/materials" element={<PublicLayout><MaterialsPage /></PublicLayout>} />
              <Route path="/materials/:id" element={<PublicLayout><MaterialDetailPage /></PublicLayout>} />
              <Route path="/request/:materialId" element={<PublicLayout><RequestPage /></PublicLayout>} />
              <Route path="/request-success" element={<PublicLayout><RequestSuccessPage /></PublicLayout>} />
              <Route path="/request-status" element={<PublicLayout><RequestStatusPage /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
              <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
              <Route path="/videos" element={<PublicLayout><VideosPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
              <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
