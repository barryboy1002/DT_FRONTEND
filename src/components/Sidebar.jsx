import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    Users,
    History,
    FileText,
    Building,
    Settings,
    Info,
    Mail,
    Store
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { user } = useAuth();

    const links = [
        {
            name: "Dashboard",
            path: "/",
            icon: LayoutDashboard
        },
        {
            name: "Products",
            path: "/products",
            icon: Package
        },
        {
            name: "New Sale",
            path: "/sales",
            icon: ShoppingCart
        },
        {
            name: "Sales History",
            path: "/sales-history",
            icon: History
        },
        {
            name: "Purchases",
            path: "/purchases",
            icon: Truck
        },
        {
            name: "Suppliers",
            path: "/suppliers",
            icon: Users
        },
        {
            name: "Reports",
            path: "/reports",
            icon: FileText
        },
        {
            name: "Branches",
            path: "/branches",
            icon: Building
        },
        {
            name: "Staff",
            path: "/staff",
            icon: Users
        },
        {
            name: "Settings",
            path: "/settings",
            icon: Settings
        },
        {
            name: "About",
            path: "/about",
            icon: Info
        },
        {
            name: "Contact",
            path: "/contact",
            icon: Mail
        }
    ];

    const filteredLinks = links.filter((link) => {
        if (user?.role === "cashier") {
            return ["/", "/products", "/sales", "/sales-history", "/about", "/contact"].includes(link.path);
        }

        if (user?.role === "manager") {
            return !["/reports", "/branches", "/staff", "/settings"].includes(link.path);
        }

        return true;
    });

    return (
        <aside className="w-64 bg-slate-900 text-white">
            <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700">
                <Store className="h-6 w-6 text-blue-400" />
                <h2 className="font-bold text-xl tracking-wide">
                    Shack
                </h2>
            </div>

            <nav className="p-4 space-y-2">
                {filteredLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg ${
                                    isActive
                                        ? "bg-slate-700"
                                        : "hover:bg-slate-800"
                                }`
                            }
                        >
                            <Icon size={18} />
                            {link.name}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}

export default Sidebar;
