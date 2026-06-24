import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div>
            <h1>DukaTrack Dashboard</h1>

            <p>
                Welcome {user?.name}
            </p>

            <p>
                Role: {user?.role}
            </p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default DashboardPage;