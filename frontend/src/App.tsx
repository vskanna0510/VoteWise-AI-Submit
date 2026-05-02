import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const AssistantPage = lazy(() => import('./pages/AssistantPage').then((m) => ({ default: m.AssistantPage })));
const TimelinePage = lazy(() => import('./pages/TimelinePage').then((m) => ({ default: m.TimelinePage })));
const SimulatorPage = lazy(() => import('./pages/SimulatorPage').then((m) => ({ default: m.SimulatorPage })));
const ChecklistPage = lazy(() => import('./pages/ChecklistPage').then((m) => ({ default: m.ChecklistPage })));
const QuizPage = lazy(() => import('./pages/QuizPage').then((m) => ({ default: m.QuizPage })));
const MythVsFactPage = lazy(() => import('./pages/MythVsFactPage').then((m) => ({ default: m.MythVsFactPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const EvaluationPage = lazy(() => import('./pages/EvaluationPage').then((m) => ({ default: m.EvaluationPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageLoader = () => (
  <div className="flex items-center justify-center h-[50vh] text-slate-400">Loading…</div>
);

export const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/*"
        element={
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/simulator" element={<SimulatorPage />} />
                <Route path="/checklist" element={<ChecklistPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/myth-vs-fact" element={<MythVsFactPage />} />
                <Route path="/evaluation" element={<EvaluationPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </MainLayout>
        }
      />
    </Routes>
  </Suspense>
);
