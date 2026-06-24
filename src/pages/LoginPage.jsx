import {useState} from "react";
import { loginUser } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function LoginPage(){
    const navigate = useNavigate();

    const {login} = useAuth();
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    async function handleSubmit(e){
        e.preventDefault();
        try{
            const response = await loginUser(email, 
                                    password);
            login(response.data.token);
            navigate("/");
        }catch(error){
            setError(
                error.response?.data?.error ||
                "Login failed"
            );
        }
    }
    return (
        <div>
            <h1>Login</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button type="submit">
                    Login
                </button>
                <p>
                    Don't have an account?
                </p>

                <Link to="/register">
                    Register
                </Link>
            </form>
        </div>
    );
}

export default LoginPage;
 
