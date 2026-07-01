import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from './context/AuthContext.jsx'
import { AppSettingsProvider } from './context/AppSettingsContext.jsx'
import App from './App.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <AppSettingsProvider>
            <App />
        </AppSettingsProvider>
    </AuthProvider>
)
