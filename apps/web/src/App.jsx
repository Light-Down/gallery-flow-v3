
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import GalleryAccessPage from '@/pages/GalleryAccessPage.jsx';
import ImmersiveGalleryPage from '@/pages/ImmersiveGalleryPage.jsx';
import FavoritesPage from '@/pages/FavoritesPage.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import GalleryForm from '@/pages/GalleryForm.jsx';
import ImageManager from '@/pages/ImageManager.jsx';

function App() {
  return (
    <AuthProvider>
      <Router basename="/galerie">
        <ScrollToTop />
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<GalleryAccessPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/gallery-access" element={<GalleryAccessPage />} />
          <Route path="/gallery/:slug" element={<ImmersiveGalleryPage />} />
          <Route path="/gallery/:slug/favorites" element={<FavoritesPage />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/galleries/new"
            element={
              <ProtectedRoute>
                <GalleryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/galleries/:id/edit"
            element={
              <ProtectedRoute>
                <GalleryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/galleries/:id/manage-images"
            element={
              <ProtectedRoute>
                <ImageManager />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
