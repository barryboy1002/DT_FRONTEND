import { useEffect, useState } from "react";

import DashboardCard from "../components/DashboardCard";
import RecentSalesTable from "../components/RecentSalesTable";

import SalesTrendChart from "../components/charts/SalesTrendChart";
import ProductDistributionChart from "../components/charts/ProductDistributionChart";

import {getDashboardSummary} from "../api/dashboardApi";
import { getRecentSales } from "../api/salesApi";

import {
getSalesTrend,
getProductDistribution
} from "../api/reportsApi";

function DashboardPage() {
   const [stats, setStats] = useState({
        todayRevenue: 0,
        lowStock: 0,
        outOfStock: 0
    });


    const [sales, setSales] = useState([]);

    const [period, setPeriod] =
        useState("monthly");

    const [trendData, setTrendData] =
        useState([]);

    const [distributionData,
        setDistributionData] =
        useState([]);

    useEffect(() => {
        async function loadDashboard() {
            try {
               const [summary, recentSales] =
                await Promise.all([
                    getDashboardSummary(),
                    getRecentSales()
                ]);

                setStats({
                    todayRevenue:
                        Number(
                            summary.data.todayRevenue
                        ) || 0,

                    lowStock:
                        Number(
                            summary.data.lowStock
                        ) || 0,

                    outOfStock:
                        Number(
                            summary.data.outOfStock
                        ) || 0
                });

                setSales(
                    recentSales.data || []
                );


            } catch (error) {
                console.error(error);
            }
        }

        loadDashboard();
    }, []);

    useEffect(() => {
        async function loadCharts() {
            try {
                const [
                    trend,
                    distribution
                ] = await Promise.all([
                    getSalesTrend(period),
                    getProductDistribution(period)
                ]);

                setTrendData(
                    trend.data || []
                );

                setDistributionData(
                    distribution.data || []
                );

            } catch (error) {
                console.error(error);
            }
        }

        loadCharts();
    }, [period]);

    return (
        <div className="space-y-8">

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                <select
                    value={period}
                    onChange={(e) =>
                        setPeriod(
                            e.target.value
                        )
                    }
                    className="border rounded-lg px-4 py-2"
                >
                    <option value="weekly">
                        Weekly
                    </option>

                    <option value="monthly">
                        Monthly
                    </option>

                    <option value="yearly">
                        Yearly
                    </option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <DashboardCard
                        title="Today's Revenue"
                        value={`KES ${stats.todayRevenue}`}
                    />

                <DashboardCard
                    title="Low Stock"
                    value={stats.lowStock}
                />

                <DashboardCard
                    title="Out Of Stock"
                    value={stats.outOfStock}
                />

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Sales Trend
                    </h2>

                    <SalesTrendChart
                        data={trendData}
                    />

                </div>

                <div className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Product Distribution
                    </h2>

                    <ProductDistributionChart
                        data={distributionData}
                    />

                </div>

            </div>

            <RecentSalesTable
                sales={sales}
            />

        </div>
    );


}

export default DashboardPage;
