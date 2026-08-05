import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";

import DriverDashboard from "./pages/DriverDashboard";
import DailyActivity from "./pages/DailyActivity";
import DriverProfile from "./pages/DriverProfile";
import DriverHealth from "./pages/DriverHealth";
import DriverLR from "./pages/DriverLR";
import ADEEDashboard from "./pages/ADEEDashboard";
import DepotManagerDashboard from "./pages/DepotManagerDashboard";
import DriverDetails from "./pages/DriverDetails";
import DriverAbnormality from "./pages/DriverAbnormality";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCircularUpload from "./pages/AdminCircularUpload";
import AdminCircularStatus from "./pages/AdminCircularStatus";
import AdminReportDownload from "./pages/AdminReportDownload";
import AdminUserDetail from "./pages/AdminUserDetail";

import CircularList from "./pages/CircularList";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRegister from "./pages/AdminRegister";
import AdminOverdueRecords from "./pages/AdminOverdueRecords";
import EnginePage from "./pages/EnginePage";
export default function App() {
  return (
    <Routes>

      {/* ================= LOGIN ================= */}
      <Route path="/" element={<Login />} />

      {/* ================= CHANGE PASSWORD (First Login) ================= */}
      <Route path="/change-password" element={<ChangePassword />} />

      {/* ================= DRIVER ================= */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/driver/abnormalities"
  element={<DriverAbnormality />}
/>

      <Route
  path="/driver/engine"
  element={
    <ProtectedRoute role="DRIVER">
      <EnginePage />
    </ProtectedRoute>
  }
/>
      <Route
  path="/adee"
  element={
    <ProtectedRoute role="ADEE">
      <ADEEDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/engine"
  element={
    <ProtectedRoute role="SUPER_ADMIN">
      <EnginePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/adee/engine"
  element={
    <ProtectedRoute role="ADEE">
      <EnginePage />
    </ProtectedRoute>
  }
/>

      <Route
        path="/admin/register"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <AdminRegister />
          </ProtectedRoute>
        }
      />


      <Route
        path="/driver/daily"
        element={
          <ProtectedRoute role="DRIVER">
            <DailyActivity />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/profile"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/health"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverHealth />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/lr"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverLR />
          </ProtectedRoute>
        }
      />

      {/* ================= DEPOT MANAGER ================= */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute role="DEPOT_MANAGER">
            <DepotManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/driver/:driverId"
        element={
          <ProtectedRoute role="DEPOT_MANAGER">
            <DriverDetails />
          </ProtectedRoute>
        }
      />


      <Route
  path="/manager/engine"
  element={
    <ProtectedRoute role="DEPOT_MANAGER">
      <EnginePage />
    </ProtectedRoute>
  }
/>

      {/* ================= SUPER ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/circular-upload"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <AdminCircularUpload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/circular-status"
        element={
          // <ProtectedRoute role={["SUPER_ADMIN","DEPOT_MANAGER"]}>
            <AdminCircularStatus />
          // </ProtectedRoute>
        }
      />

      <Route
        path="/admin/report-download"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <AdminReportDownload />
          </ProtectedRoute>
        }
      />
<Route
  path="/admin/overdue-records"
  element={
    <ProtectedRoute role="SUPER_ADMIN">
      <AdminOverdueRecords />
    </ProtectedRoute>
  }
/>

      <Route
        path="/admin/user/:userId"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <AdminUserDetail />
          </ProtectedRoute>
        }
      />

      {/* ================= CIRCULARS (ALL ROLES) ================= */}
      <Route
        path="/circulars"
        element={
          <ProtectedRoute>
            <CircularList />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
