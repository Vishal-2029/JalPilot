import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/public/PublicLayout";
import { SuperAdminLayout } from "@/layouts/super-admin/SuperAdminLayout";
import { CompanyAdminLayout } from "@/layouts/company-admin/CompanyAdminLayout";
import { CustomerLayout } from "@/layouts/customer/CustomerLayout";
import { DeliveryStaffLayout } from "@/layouts/delivery-staff/DeliveryStaffLayout";
import { AuthGuard } from "@/guards/AuthGuard";
import { RoleGuard } from "@/guards/RoleGuard";
import { HomePage } from "@/modules/public-website/pages/HomePage";
import { FeaturesPage, PricingPage, ThemesShowcasePage, StaticInfoPage } from "@/modules/public-website/pages/MarketingPages";
import { LoginPage } from "@/modules/authentication/pages/LoginPage";
import { RegisterCompanyPage } from "@/modules/authentication/pages/RegisterCompanyPage";
import { AcceptInvitationPage } from "@/modules/authentication/invitation/AcceptInvitationPage";
import { SuperAdminDashboardPage } from "@/modules/super-admin/dashboard/SuperAdminDashboardPage";
import { CompaniesPage } from "@/modules/super-admin/companies/CompaniesPage";
import { ThemesCataloguePage } from "@/modules/super-admin/themes/ThemesCataloguePage";
import { SupportTicketsPage, AuditLogsPage } from "@/modules/super-admin/audit-logs/SupportAuditPages";
import { CompanyDashboardPage } from "@/modules/company-admin/dashboard/CompanyDashboardPage";
import { CustomersPage } from "@/modules/company-admin/customers/CustomersPage";
import { ProductsPage } from "@/modules/company-admin/products/ProductsPage";
import { DeliveriesPage } from "@/modules/company-admin/deliveries/DeliveriesPage";
import { PaymentsPage } from "@/modules/company-admin/payments/PaymentsPage";
import { ExpensesPage } from "@/modules/company-admin/expenses/ExpensesPage";
import { LeaveManagementPage } from "@/modules/company-admin/leave-management/LeaveManagementPage";
import { StaffPage } from "@/modules/company-admin/staff/StaffPage";
import { ReportsPage } from "@/modules/company-admin/reports/ReportsPage";
import { ThemeMarketplacePage } from "@/modules/company-admin/theme-marketplace/ThemeMarketplacePage";
import { SettingsPage } from "@/modules/company-admin/settings/SettingsPage";
import { CustomerDashboardPage } from "@/modules/customer/dashboard/CustomerDashboardPage";
import {
  CustomerDeliveriesPage,
  CustomerExpensesPage,
  CustomerPaymentsPage,
  CustomerLeavePage,
} from "@/modules/customer/CustomerPortalPages";
import { StaffDeliveriesPage } from "@/modules/delivery-staff/StaffDeliveriesPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/features", element: <FeaturesPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/themes", element: <ThemesShowcasePage /> },
      { path: "/about", element: <StaticInfoPage title="About JalPilot" body="JalPilot empowers water jar & water supply businesses to replace manual paper registers with an auditable, multi-tenant cloud platform." /> },
      { path: "/contact", element: <StaticInfoPage title="Contact Us" body="Reach our team at support@jalpilot.com for enterprise onboarding and custom domain setup." /> },
      { path: "/terms", element: <StaticInfoPage title="Terms & Conditions" body="Standard JalPilot SaaS terms of service apply to all registered tenant workspaces." /> },
      { path: "/privacy", element: <StaticInfoPage title="Privacy Policy" body="All tenant customer records and financial ledgers are strictly isolated using PostgreSQL Row-Level Security." /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterCompanyPage /> },
      { path: "/accept-invitation", element: <AcceptInvitationPage /> },
    ],
  },
  {
    path: "/super-admin",
    element: (
      <RoleGuard requirePlatformRole="SUPER_ADMIN">
        <SuperAdminLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/super-admin/dashboard" replace /> },
      { path: "dashboard", element: <SuperAdminDashboardPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "themes", element: <ThemesCataloguePage /> },
      { path: "support", element: <SupportTicketsPage /> },
      { path: "audit-logs", element: <AuditLogsPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <CompanyAdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <CompanyDashboardPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "deliveries", element: <DeliveriesPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "expenses", element: <ExpensesPage /> },
      { path: "leave-management", element: <LeaveManagementPage /> },
      { path: "staff", element: <StaffPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "themes", element: <ThemeMarketplacePage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "/customer",
    element: (
      <AuthGuard>
        <CustomerLayout />
      </AuthGuard>
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
      <AuthGuard>
        <DeliveryStaffLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/staff/deliveries" replace /> },
      { path: "deliveries", element: <StaffDeliveriesPage /> },
    ],
  },
]);
