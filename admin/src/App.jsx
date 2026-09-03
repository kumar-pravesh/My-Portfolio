import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

import AdminLayout from "./components/layout/AdminLayout.jsx";

// Lazy Pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const ProjectsList = lazy(
  () => import("./pages/projects/ProjectsListPage.jsx"),
);
const ProjectForm = lazy(() => import("./pages/projects/ProjectFormPage.jsx"));
const ProjectDetail = lazy(
  () => import("./pages/projects/ProjectDetailPage.jsx"),
);
const LeadsList = lazy(() => import("./pages/leads/LeadsListPage.jsx"));
const LeadDetail = lazy(() => import("./pages/leads/LeadDetailPage.jsx"));
const LeadForm = lazy(() => import("./pages/leads/LeadFormPage.jsx"));
const ContactsList = lazy(
  () => import("./pages/contacts/ContactsListPage.jsx"),
);
const ContactDetail = lazy(
  () => import("./pages/contacts/ContactDetailPage.jsx"),
);
const ContentList = lazy(() => import("./pages/content/ContentListPage.jsx"));
const ContentForm = lazy(() => import("./pages/content/ContentFormPage.jsx"));
const UsersPage = lazy(() => import("./pages/users/UsersPage.jsx"));
const ActivityLogs = lazy(
  () => import("./pages/activitylogs/ActivityLogsPage.jsx"),
);
const AnalyticsPage = lazy(() => import("./pages/analytics/AnalyticsPage.jsx"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

const CaseStudyForm = lazy(
  () => import("./pages/case_studies/CaseStudyFormPage.jsx"),
);
const BlogList = lazy(() => import("./pages/blog/BlogListPage.jsx"));
const BlogForm = lazy(() => import("./pages/blog/BlogFormPage.jsx"));
const MediaList = lazy(() => import("./pages/media/MediaLibraryPage.jsx"));
const MediaForm = lazy(() => import("./pages/media/MediaUploadPage.jsx"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/admin" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:refId" element={<ProjectDetail />} />
          <Route path="projects/:refId/edit" element={<ProjectForm />} />
          <Route path="leads" element={<LeadsList />} />
          <Route path="leads/new" element={<LeadForm />} />
          <Route path="leads/:refId" element={<LeadDetail />} />
          <Route path="leads/:refId/edit" element={<LeadForm />} />
          <Route path="contacts" element={<ContactsList />} />
          <Route path="contacts/:refId" element={<ContactDetail />} />
          {/* Content modules (services, case-studies, blog, testimonials) */}
          <Route path="services" element={<ContentList module="services" />} />
          <Route
            path="services/new"
            element={<ContentForm module="services" />}
          />
          <Route
            path="services/:refId/edit"
            element={<ContentForm module="services" />}
          />
          <Route
            path="case-studies"
            element={<ContentList module="case_studies" />}
          />
          <Route path="case-studies/new" element={<CaseStudyForm />} />
          <Route path="case-studies/:refId/edit" element={<CaseStudyForm />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/new" element={<BlogForm />} />
          <Route path="blog/:refId/edit" element={<BlogForm />} />
          <Route path="media" element={<MediaList />} />
          <Route path="media/upload" element={<MediaForm />} />
          <Route path="media/:refId/edit" element={<MediaForm />} />
          <Route
            path="users"
            element={
              <ProtectedRoute roles={["SUPER_ADMIN"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
