import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        businessName: "",
        plan: "free",
        phone: "",
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register", formData);

            navigate("/login");
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Create Your Business Account</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        name="businessName"
                        placeholder="Business Name"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <input
                        type="text"
                        name="name"
                        placeholder="Owner Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <select
                        name="plan"
                        value={formData.plan}
                        onChange={handleChange}
                    >
                        <option value="free">
                            Free
                        </option>

                        <option value="starter">
                            Starter
                        </option>

                        <option value="pro">
                            Pro
                        </option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating Account..."
                        : "Register"}
                </button>
            </form>

            <p>
                Already have an account?{" "}
                <Link to="/login">
                    Login
                </Link>
            </p>
        </div>
    );
}

export default RegisterPage;