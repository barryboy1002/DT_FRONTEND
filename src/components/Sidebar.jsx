import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    Users
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
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
            name: "Sales",
            path: "/sales",
            icon: ShoppingCart
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
        }
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white">
            <div className="h-16 flex items-center px-6 border-b border-slate-700">
                <h2 className="font-bold text-xl">
                    DukaTrack
                </h2>
            </div>

            <nav className="p-4 space-y-2">
                {links.map((link) => {
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