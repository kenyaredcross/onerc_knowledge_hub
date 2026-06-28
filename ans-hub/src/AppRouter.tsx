import { Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import AboutPage from "./components/about/About.tsx";
import ForgotPassword from "./components/auth/ForgotPassword.tsx";
import LoginForm from "./components/auth/Login.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
import ResetPassword from "./components/auth/ResetPassword.tsx";
import SetPassword from "./components/auth/SetPassword.tsx";
import Connect from "./components/connect/Connect.tsx";
import Home from "./components/dashboard/Home.tsx";
import ErrorPage403 from "./components/error/ErrorPage403.tsx";
import ErrorPage404 from "./components/error/ErrorPage404.tsx";
import EventDetail from "./components/events/EventDetail.tsx";
import EventsIndex from "./components/events/EventsIndex.tsx";
import NewEvent from "./components/events/NewEvent.tsx";
import FAQs from "./components/faqs/FAQs.tsx";
import FinancialSustainabilityDashboard from "./components/financial-sustainability/FinancialSustainabilityDashboard.tsx";
import FSResponses from "./components/financial-sustainability/FSResponses.tsx";
import Knowledge from "./components/knowledge/Knowledge.tsx";
import KnowledgeDetail from "./components/knowledge/KnowledgeDetail.tsx";
import KnowledgeFiltered from "./components/knowledge/KnowledgeFiltered.tsx";
import NewKnowledge from "./components/knowledge/NewKnowledge.tsx";
import DashboardLayout from "./components/layout/DashboardLayout.tsx";
import LearningHub from "./components/learning/LearningHub.tsx";
import NewLearning from "./components/learning/NewLearning.tsx";
import NationalSocietiesIndex from "./components/national-societies/NationalSocietiesIndex.tsx";
import NationalSocietyDetail from "./components/national-societies/NationalSocietyDetail.tsx";
import NewsDetail from "./components/news/NewsDetail.tsx";
import NewsIndex from "./components/news/NewsIndex.tsx";
import NewNews from "./components/news/NewNews.tsx";
import PendingApprovalPage from "./components/pending-approval/PendingApproval.tsx";
import Pillars from "./components/pillars/Pillars.tsx";
import Profile from "./components/profile/Profile.tsx";
import UsersManagement from "./components/users/UsersManagement.tsx";

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<App />}>
        {/* Standalone routes (no sidebar) */}
        <Route path="/" element={<AboutPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/403" element={<ErrorPage403 />} />

        {/* Dashboard routes (with sidebar layout) - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<Home />} />
            <Route
              path="/financial-sustainability"
              element={<FinancialSustainabilityDashboard />}
            />
            <Route
              path="/financial-sustainability/responses"
              element={<FSResponses />}
            />
            <Route path="/news" element={<NewsIndex />} />
            <Route path="/news/:slug" element={<NewsDetail />} />
            <Route path="/create/news" element={<NewNews />} />
            <Route path="/events" element={<EventsIndex />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/create/event" element={<NewEvent />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/knowledge/filter/:type" element={<KnowledgeFiltered />} />
            <Route path="/knowledge/:slug" element={<KnowledgeDetail />} />
            <Route path="/learning" element={<LearningHub />} />
            <Route path="/create/knowledge" element={<NewKnowledge />} />
            <Route path="/create/learning" element={<NewLearning />} />
            <Route
              path="/national-societies"
              element={<NationalSocietiesIndex />}
            />
            <Route
              path="/national-societies/:slug"
              element={<NationalSocietyDetail />}
            />
            <Route path="/pillars" element={<Pillars />} />
            <Route path="/connect" element={<Connect />} />
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
