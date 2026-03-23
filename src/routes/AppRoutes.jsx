import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// layout
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";

import AdminReports from "../pages/dashboard/AdminReports.jsx";


// Pages — Auth
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";

// Pages — Public
import Home from "../pages/home/Home.jsx";
import BrowseGigs from "../pages/gigs/BrowseGigs.jsx";
import GigDetail from "../pages/gigs/GigDetail.jsx";
import SellerProfile from "../pages/profile/SellerProfile.jsx";

// Pages — Seller
import SellerDashboard from "../pages/dashboard/SellerDashboard.jsx";
import CreateGig from "../pages/gigs/CreateGig.jsx";
import EditGig from "../pages/gigs/EditGig.jsx";
import SellerOrders from "../pages/orders/SellerOrders.jsx";

// Pages — Buyer
import BuyerDashboard from "../pages/dashboard/BuyerDashboard.jsx";
import BuyerOrders from "../pages/orders/BuyerOrders.jsx";

// Pages — Shared
import OrderDetail from "../pages/orders/OrderDetail.jsx";
import EditProfile from "../pages/profile/EditProfile.jsx";

// Loaders
import Loader from "../components/common/Loader.jsx";
import Payment from "../pages/payment/payment.jsx";
import AdminDashboard from "../pages/dashboard/AdminDashboard.jsx";

// ─── Protected Route ───
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Loader fullPage />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ─── Guest Route — logged in ho toh redirect ───
// ─── Guest Route — logged in ho toh role ke hisaab se redirect ───
const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Loader fullPage />;

  if (isAuthenticated) {
    // Role ke hisaab se sahi jagah bhejo
    if (user?.role === "admin")  return <Navigate to="/admin" replace />;
    if (user?.role === "seller") return <Navigate to="/seller/dashboard" replace />;
    if (user?.role === "buyer")  return <Navigate to="/buyer/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - var(--navbar-height))" }}>
        <Routes>

          {/* ── Public Routes ── */}
          <Route path="/" element={<Home />} />
          <Route path="/gigs" element={<BrowseGigs />} />
          <Route path="/gigs/:slug" element={<GigDetail />} />
          <Route path="/seller/:id" element={<SellerProfile />} />

          {/* ── Guest Routes ── */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* ── Seller Routes ── */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute role="seller">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/gigs/create"
            element={
              <ProtectedRoute role="seller">
                <CreateGig />
              </ProtectedRoute>
            }
          />
          <Route
  path="/admin/reports"
  element={
    <ProtectedRoute role="admin">
      <AdminReports />
    </ProtectedRoute>
  }
/>
          <Route
            path="/seller/gigs/edit/:id"
            element={
              <ProtectedRoute role="seller">
                <EditGig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute role="seller">
                <SellerOrders />
              </ProtectedRoute>
            }
          />
          <Route
  path="/orders/:id/pay"
  element={
    <ProtectedRoute role="buyer">
      <Payment />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin"
  element={
    <ProtectedRoute role="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
          {/* ── Buyer Routes ── */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute role="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/orders"
            element={
              <ProtectedRoute role="buyer">
                <BuyerOrders />
              </ProtectedRoute>
            }
          />

          {/* ── Shared Protected Routes ── */}
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* ── 404 ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default AppRoutes;