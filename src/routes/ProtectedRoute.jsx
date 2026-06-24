import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (!token) {
        return <Navigate to="/login" />
    }

    return children;
}

export default ProtectedRoute;