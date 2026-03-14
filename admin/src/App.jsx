import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import { useAuth, useUser, useClerk } from "@clerk/clerk-react";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardLayout from "./layouts/DashboardLayout";
import CouponsPage from "./pages/CouponsPage";
import PageLoader from "./components/PageLoader";
import { useEffect, useState } from "react";

function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!user) return;

    const email = user.primaryEmailAddress?.emailAddress;

    if (email !== import.meta.env.VITE_ADMIN_EMAIL) {
      alert("❌ Từ chối đăng nhập - Bạn không phải quản trị viên");
      signOut();
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }
  }, [user]);

  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isSignedIn && isAdmin ? (
            <Navigate to={"/dashboard"} />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/"
        element={
          isSignedIn && isAdmin ? (
            <DashboardLayout />
          ) : (
            <Navigate to={"/login"} />
          )
        }
      >
        <Route index element={<Navigate to={"dashboard"} />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="coupons" element={<CouponsPage />} />
      </Route>
    </Routes>
  );
}

export default App;