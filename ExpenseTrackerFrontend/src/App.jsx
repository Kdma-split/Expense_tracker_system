import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import EmployeeDraftsPage from "./pages/employee/EmployeeDraftsPage";
import EmployeeSubmittedPage from "./pages/employee/EmployeeSubmittedPage";
import EmployeeApprovedPage from "./pages/employee/EmployeeApprovedPage";
import EmployeeRejectedPage from "./pages/employee/EmployeeRejectedPage";
import ManagerPendingPage from "./pages/manager/ManagerPendingPage";
import ManagerApprovedPage from "./pages/manager/ManagerApprovedPage";
import ManagerRejectedPage from "./pages/manager/ManagerRejectedPage";
import FinancePendingPage from "./pages/finance/FinancePendingPage";
import FinanceApprovedPage from "./pages/finance/FinanceApprovedPage";
import FinanceRejectedPage from "./pages/finance/FinanceRejectedPage";
import FinanceOnHoldPage from "./pages/finance/FinanceOnHoldPage";
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

      <Route path="employee/drafts" element={<ProtectedRoute roles={["Employee", "Manager", "Director"]}><EmployeeDraftsPage /></ProtectedRoute>} />
      <Route path="employee/submitted" element={<ProtectedRoute roles={["Employee", "Manager", "Director"]}><EmployeeSubmittedPage /></ProtectedRoute>} />
      <Route path="employee/approved" element={<ProtectedRoute roles={["Employee", "Manager", "Director"]}><EmployeeApprovedPage /></ProtectedRoute>} />
      <Route path="employee/rejected" element={<ProtectedRoute roles={["Employee", "Manager", "Director"]}><EmployeeRejectedPage /></ProtectedRoute>} />

      <Route path="manager/pending" element={<ProtectedRoute roles={["Manager", "Director"]}><ManagerPendingPage /></ProtectedRoute>} />
      <Route path="manager/approved" element={<ProtectedRoute roles={["Manager", "Director"]}><ManagerApprovedPage /></ProtectedRoute>} />
      <Route path="manager/rejected" element={<ProtectedRoute roles={["Manager", "Director"]}><ManagerRejectedPage /></ProtectedRoute>} />

      <Route path="finance/pending" element={<ProtectedRoute roles={["Finance"]}><FinancePendingPage /></ProtectedRoute>} />
      <Route path="finance/on-hold" element={<ProtectedRoute roles={["Finance"]}><FinanceOnHoldPage /></ProtectedRoute>} />
      <Route path="finance/rejected" element={<ProtectedRoute roles={["Finance"]}><FinanceRejectedPage /></ProtectedRoute>} />
      <Route path="finance/approved" element={<ProtectedRoute roles={["Finance"]}><FinanceApprovedPage /></ProtectedRoute>} />

      <Route path="admin/employees" element={<ProtectedRoute roles={["Admin"]}><AdminEmployeesPage /></ProtectedRoute>} />
      <Route path="admin/analytics" element={<ProtectedRoute roles={["Admin", "Finance"]}><AdminAnalyticsPage /></ProtectedRoute>} />
    </Route>
  </Routes>
);

export default App;
