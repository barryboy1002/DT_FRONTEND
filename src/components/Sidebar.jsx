import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { logout } = useAuth();

    return (
        <aside
            style={{
                width: "250px",
                padding: "20px",
                borderRight: "1px solid #ddd"
            }}
        >
            <h2>DukaTrack</h2>

            <nav
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                }}
            >
                <Link to="/">
                    Dashboard
                </Link>

                <Link to="/products">
                    Products
                </Link>

                <Link to="/sales">
                    Sales
                </Link>

                <Link to="/purchases">
                    Purchases
                </Link>

                <Link to="/suppliers">
                    Suppliers
                </Link>
            </nav>

            <hr />

            <button onClick={logout}>
                Logout
            </button>
        </aside>
    );
}

export default Sidebar;