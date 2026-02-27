import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import EmployeeDraftsPage from "./pages/employee/EmployeeDraftsPage";
import EmployeeSubmittedPage from "./pages/employee/EmployeeSubmittedPage";
import EmployeeApprovedPage from "./pages/employee/EmployeeApprovedPage";
import ManagerPendingPage from "./pages/manager/ManagerPendingPage";
import ManagerApprovedPage from "./pages/manager/ManagerApprovedPage";
import FinancePendingPage from "./pages/finance/FinancePendingPage";
import FinanceApprovedPage from "./pages/finance/FinanceApprovedPage";
import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/login" replace />} />

      <Route path="employee/drafts" element={<ProtectedRoute roles={["Employee"]}><EmployeeDraftsPage /></ProtectedRoute>} />
      <Route path="employee/submitted" element={<ProtectedRoute roles={["Employee"]}><EmployeeSubmittedPage /></ProtectedRoute>} />
      <Route path="employee/approved" element={<ProtectedRoute roles={["Employee"]}><EmployeeApprovedPage /></ProtectedRoute>} />

      <Route path="manager/pending" element={<ProtectedRoute roles={["Manager"]}><ManagerPendingPage /></ProtectedRoute>} />
      <Route path="manager/approved" element={<ProtectedRoute roles={["Manager"]}><ManagerApprovedPage /></ProtectedRoute>} />

      <Route path="finance/pending" element={<ProtectedRoute roles={["Finance"]}><FinancePendingPage /></ProtectedRoute>} />
      <Route path="finance/approved" element={<ProtectedRoute roles={["Finance"]}><FinanceApprovedPage /></ProtectedRoute>} />

      <Route path="admin/employees" element={<ProtectedRoute roles={["Admin"]}><AdminEmployeesPage /></ProtectedRoute>} />
      <Route path="admin/analytics" element={<ProtectedRoute roles={["Admin"]}><AdminAnalyticsPage /></ProtectedRoute>} />
    </Route>
  </Routes>
);

export default App;
