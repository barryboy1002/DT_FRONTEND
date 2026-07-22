import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingWizard from "./pages/OnboardingWizard";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import PurchasesPage from "./pages/PurchasesPage";
import SuppliersPage from "./pages/SuppliersPage";
import ReportsPage from "./pages/ReportsPage";
import BranchesPage from "./pages/BranchesPage";
import StaffPage from "./pages/StaffPage";
import SettingsPage from "./pages/SettingsPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import RequireRole from "./routes/RequireRole";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/onboarding"
                    element={
                        <ProtectedRoute>
                            <OnboardingWizard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<DashboardPage />}
                    />

                    <Route
                        path="products"
                        element={<ProductsPage />}
                    />

                    <Route
                        path="sales"
                        element={<SalesPage />}
                    />

                    <Route
                        path="sales-history"
                        element={<SalesHistoryPage />}
                    />

                    <Route
                        path="purchases"
                        element={<PurchasesPage />}
                    />

                    <Route
                        path="suppliers"
                        element={<SuppliersPage />}
                    />

                    <Route
                        path="reports"
                        element={
                            <RequireRole allowedRoles={["owner"]}>
                                <ReportsPage />
                            </RequireRole>
                        }
                    />

                    <Route
                        path="branches"
                        element={
                            <RequireRole allowedRoles={["owner"]}>
                                <BranchesPage />
                            </RequireRole>
                        }
                    />

                    <Route
                        path="staff"
                        element={
                            <RequireRole allowedRoles={["owner"]}>
                                <StaffPage />
                            </RequireRole>
                        }
                    />

                    <Route
                        path="settings"
                        element={
                            <RequireRole allowedRoles={["owner"]}>
                                <SettingsPage />
                            </RequireRole>
                        }
                    />

                    <Route
                        path="about"
                        element={<AboutPage />}
                    />

                    <Route
                        path="contact"
                        element={<ContactPage />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;