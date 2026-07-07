import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { logout, user } = useAuth();

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
            <div>
                <h1 className="font-semibold text-lg">
                    Sh-Track
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
