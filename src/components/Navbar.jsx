import { LogOut, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { logout, user } = useAuth();

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                <h1 className="font-bold text-lg text-slate-800">
                    Shack
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                    {user?.name}
                </span>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-red-500"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Navbar;
