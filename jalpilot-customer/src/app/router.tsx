import { createBrowserRouter, Navigate } from "react-router-dom";
import { CustomerLayout } from "@/layouts/customer/CustomerLayout";
import { DeliveryStaffLayout } from "@/layouts/delivery-staff/DeliveryStaffLayout";
import { PortalLoginPage } from "@/modules/authentication/login/PortalLoginPage";
import { AcceptInvitationPage } from "@/modules/authentication/invitation/AcceptInvitationPage";
import { CustomerDashboardPage } from "@/modules/customer/dashboard/CustomerDashboardPage";
import {
  CustomerDeliveriesPage,
  CustomerExpensesPage,
  CustomerPaymentsPage,
  CustomerLeavePage,
} from "@/modules/customer/CustomerPortalPages";
import { StaffDeliveriesPage } from "@/modules/delivery-staff/StaffDeliveriesPage";
import { useAuth } from "@/contexts/AuthContext";

function RequirePortalAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <PortalLoginPage /> },
  { path: "/accept-invitation", element: <AcceptInvitationPage /> },
  {
    path: "/customer",
    element: (
      <RequirePortalAuth>
        <CustomerLayout />
      </RequirePortalAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/customer/dashboard" replace /> },
      { path: "dashboard", element: <CustomerDashboardPage /> },
      { path: "deliveries", element: <CustomerDeliveriesPage /> },
      { path: "expenses", element: <CustomerExpensesPage /> },
      { path: "payments", element: <CustomerPaymentsPage /> },
      { path: "leave-requests", element: <CustomerLeavePage /> },
    ],
  },
  {
    path: "/staff",
    element: (
      <RequirePortalAuth>
        <DeliveryStaffLayout />
      </RequirePortalAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/staff/deliveries" replace /> },
      { path: "deliveries", element: <StaffDeliveriesPage /> },
    ],
  },
]);

