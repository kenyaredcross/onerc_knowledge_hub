import { Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import DashboardLayout from "./components/layout/DashboardLayout.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
import LoginForm from "./components/auth/Login.tsx";
import SetPassword from "./components/auth/SetPassword.tsx";
import ForgotPassword from "./components/auth/ForgotPassword.tsx";
import ResetPassword from "./components/auth/ResetPassword.tsx";
import Home from "./components/dashboard/Home.tsx";
import AboutPage from "./components/about/About.tsx";
import PendingApprovalPage from "./components/pending-approval/PendingApproval.tsx";
import NewsIndex from "./components/news/NewsIndex.tsx";
import NewsDetail from "./components/news/NewsDetail.tsx";
import EventsIndex from "./components/events/EventsIndex.tsx";
import EventDetail from "./components/events/EventDetail.tsx";
import Knowledge from "./components/knowledge/Knowledge.tsx";
import NationalSocietiesIndex from "./components/national-societies/NationalSocietiesIndex.tsx";
import NationalSocietyDetail from "./components/national-societies/NationalSocietyDetail.tsx";
import Pillars from "./components/pillars/Pillars.tsx";
import UsersManagement from "./components/users/UsersManagement.tsx";
import FAQs from "./components/faqs/FAQs.tsx";
import Profile from "./components/profile/Profile.tsx";
import ErrorPage403 from "./components/error/ErrorPage403.tsx";
import ErrorPage404 from "./components/error/ErrorPage404.tsx";

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<App />}>
        {/* Standalone routes (no sidebar) */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/403" element={<ErrorPage403 />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Dashboard routes (with sidebar layout) - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<NewsIndex />} />
            <Route path="/news/:slug" element={<NewsDetail />} />
            <Route path="/events" element={<EventsIndex />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/national-societies" element={<NationalSocietiesIndex />} />
            <Route path="/national-societies/:slug" element={<NationalSocietyDetail />} />
            <Route path="/pillars" element={<Pillars />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<ErrorPage404 />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
