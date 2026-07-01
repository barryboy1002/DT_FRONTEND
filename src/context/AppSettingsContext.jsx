import { createContext, useContext, useEffect, useState } from "react";

const AppSettingsContext = createContext();

function getStoredValue(key, fallback) {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const saved = window.localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error(error);
        return fallback;
    }
}

function AppSettingsProvider({ children }) {
    const [dateRange, setDateRange] = useState(() => getStoredValue("dukatrack.dateRange", { from: "", to: "" }));
    const [dashboardPeriod, setDashboardPeriod] = useState(() => getStoredValue("dukatrack.dashboardPeriod", "monthly"));
    const [salesHistoryFilters, setSalesHistoryFilters] = useState(() => getStoredValue("dukatrack.salesHistoryFilters", {
        from: "",
        to: "",
        paymentMethod: ""
    }));
    const [purchaseFilters, setPurchaseFilters] = useState(() => getStoredValue("dukatrack.purchaseFilters", {
        from: "",
        to: ""
    }));

    useEffect(() => {
        window.localStorage.setItem("dukatrack.dateRange", JSON.stringify(dateRange));
    }, [dateRange]);

    useEffect(() => {
        window.localStorage.setItem("dukatrack.dashboardPeriod", JSON.stringify(dashboardPeriod));
    }, [dashboardPeriod]);

    useEffect(() => {
        window.localStorage.setItem("dukatrack.salesHistoryFilters", JSON.stringify(salesHistoryFilters));
    }, [salesHistoryFilters]);

    useEffect(() => {
        window.localStorage.setItem("dukatrack.purchaseFilters", JSON.stringify(purchaseFilters));
    }, [purchaseFilters]);

    return (
        <AppSettingsContext.Provider
            value={{
                dateRange,
                setDateRange,
                dashboardPeriod,
                setDashboardPeriod,
                salesHistoryFilters,
                setSalesHistoryFilters,
                purchaseFilters,
                setPurchaseFilters
            }}
        >
            {children}
        </AppSettingsContext.Provider>
    );
}

function useAppSettings() {
    const context = useContext(AppSettingsContext);

    if (!context) {
        throw new Error("useAppSettings must be used within an AppSettingsProvider");
    }

    return context;
}

export { AppSettingsProvider, useAppSettings };
