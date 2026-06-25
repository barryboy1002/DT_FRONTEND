import { useState, useEffect } from "react";
import { TrendingUp, Package, AlertTriangle, Calendar, ArrowUpRight, ArrowDownRight, ShoppingCart, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { getStockMovements } from "../api/stockApi";

function ReportsPage() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    async function loadStockMovements(currentPage) {
        setLoading(true);
        try {
            const offset = (currentPage - 1) * limit;
            const response = await getStockMovements({ limit, offset });
            setMovements(response.data || []);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to load stock movements.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStockMovements(page);
    }, [page]);

    // Calculate statistics from movements
    const totalMovements = movements.length;
    const purchaseCount = movements.filter(m => m.cause === 'purchase').length;
    const saleCount = movements.filter(m => m.cause === 'sale').length;
    const adjustmentCount = movements.filter(m => m.cause === 'adjustment').length;

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateStr;
        }
    };

    const getCauseIcon = (cause) => {
        switch (cause) {
            case 'purchase':
                return <ArrowUpRight className="h-4 w-4 text-green-600" />;
            case 'sale':
                return <ArrowDownRight className="h-4 w-4 text-blue-600" />;
            case 'adjustment':
                return <TrendingUp className="h-4 w-4 text-amber-600" />;
            case 'spoilage':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            default:
                return <Package className="h-4 w-4 text-gray-600" />;
        }
    };

    const getCauseBadge = (cause) => {
        const styles = {
            purchase: "bg-green-50 text-green-700 border-green-200",
            sale: "bg-blue-50 text-blue-700 border-blue-200",
            adjustment: "bg-amber-50 text-amber-700 border-amber-200",
            spoilage: "bg-red-50 text-red-700 border-red-200",
            transfer: "bg-gray-50 text-gray-700 border-gray-200"
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[cause] || styles.transfer}`}>
                {getCauseIcon(cause)}
                <span className="capitalize">{cause}</span>
            </span>
        );
    };

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto text-gray-900">
            
            {/* Header Area */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reports</h1>
                <p className="text-gray-500 mt-1">View recent stock movements and inventory activity</p>
            </div>

            {/* Error banner */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm">Error</h4>
                        <p className="text-xs mt-1 text-red-700">{errorMsg}</p>
                    </div>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Movements</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalMovements}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Purchases</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{purchaseCount}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <Truck className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Sales</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{saleCount}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <ShoppingCart className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Adjustments</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{adjustmentCount}</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg">
                            <TrendingUp className="h-8 w-8 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Movements Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <h2 className="font-semibold text-lg text-gray-900">Recent Stock Movements</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Showing {limit} transactions per page</p>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Loading stock movements...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold">Date & Time</th>
                                    <th className="p-4 font-semibold">Product</th>
                                    <th className="p-4 font-semibold">Type</th>
                                    <th className="p-4 font-semibold text-right">Quantity</th>
                                    <th className="p-4 font-semibold">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {movements.map((movement) => (
                                    <tr key={movement.movement_id} className="hover:bg-gray-50 transition-colors duration-150 text-gray-900">
                                        <td className="p-4 text-gray-600 text-xs">
                                            {formatDate(movement.date_time)}
                                        </td>
                                        <td className="p-4 font-semibold">
                                            {movement.name || `Product #${movement.product_id}`}
                                        </td>
                                        <td className="p-4">
                                            {getCauseBadge(movement.cause)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`font-bold ${Number(movement.quantity) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {Number(movement.quantity) > 0 ? '+' : ''}{Number(movement.quantity).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 text-xs">
                                            {movement.note || "—"}
                                        </td>
                                    </tr>
                                ))}
                                {movements.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center p-12 text-gray-400 bg-gray-50">
                                            No stock movements recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && movements.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Page {page} • Showing {movements.length} movements
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    page === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 cursor-pointer"
                                }`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Previous</span>
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={movements.length < limit}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    movements.length < limit
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 cursor-pointer"
                                }`}
                            >
                                <span>Next</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportsPage;
