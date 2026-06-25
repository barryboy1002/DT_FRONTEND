import { useState, useEffect } from "react";
import { Search, X, Eye, Calendar, DollarSign, Clock, User, FileText } from "lucide-react";
import { getSales, getSale } from "../api/salesApi";

function SalesHistoryPage() {
    const [sales, setSales] = useState([]);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [paymentMethod, setPaymentMethod] = useState(""); // empty means All Payments
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Detail Modal State
    const [selectedSale, setSelectedSale] = useState(null);
    const [saleDetails, setSaleDetails] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    async function loadSalesList(params = {}) {
        setLoading(true);
        try {
            const queryParams = {};
            if (params.from) queryParams.from = params.from;
            if (params.to) queryParams.to = params.to;
            if (params.paymentMethod) queryParams.payment_method = params.paymentMethod;
            if (params.search) queryParams.search = params.search;

            const response = await getSales(queryParams);
            setSales(response.data || []);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to retrieve sales records.");
        } finally {
            setLoading(false);
        }
    }

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // Reload list when filters change
    useEffect(() => {
        loadSalesList({
            from,
            to,
            paymentMethod,
            search: debouncedSearch
        });
    }, [from, to, paymentMethod, debouncedSearch]);

    const handleViewDetails = async (sale) => {
        setSelectedSale(sale);
        setShowDetailsModal(true);
        setLoadingDetails(true);
        setSaleDetails(null);
        try {
            const res = await getSale(sale.sale_id);
            setSaleDetails(res.data);
        } catch (err) {
            console.error(err);
            setErrorMsg("Could not fetch sale details.");
        } finally {
            setLoadingDetails(false);
        }
    };

    // Calculate sum totals of the current visible page
    const totalAmountSum = sales.reduce((sum, item) => sum + Number(item.total || 0), 0);

    const formatPaymentMethod = (method) => {
        if (!method) return "-";
        return method.charAt(0).toUpperCase() + method.slice(1);
    };

    const getPaymentBadgeClass = (method) => {
        switch (method?.toLowerCase()) {
            case "cash":
                return "bg-green-50 text-green-700 border border-green-150 px-2.5 py-1 rounded-full text-xs font-semibold";
            case "mpesa":
                return "bg-blue-50 text-blue-700 border border-blue-150 px-2.5 py-1 rounded-full text-xs font-semibold";
            case "credit":
                return "bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-semibold";
        }
    };

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto text-gray-900">
            
            {/* Header Area */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sales History</h1>
                <p className="text-gray-500 mt-1">Review past receipts, payments, and transaction history</p>
            </div>

            {/* Error banner */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 relative shadow-sm">
                    <X className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm">Error</h4>
                        <p className="text-xs mt-1 text-red-700">{errorMsg}</p>
                    </div>
                    <button
                        onClick={() => setErrorMsg("")}
                        className="absolute top-4 right-4 text-red-650 hover:text-red-800 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Filters and Stats Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                
                {/* Inputs block */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">From</span>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none h-10"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">To</span>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none h-10"
                        />
                    </div>

                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none h-10 min-w-[140px]"
                    >
                        <option value="">All Payments</option>
                        <option value="cash">Cash</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="credit">Credit</option>
                    </select>

                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 h-10 min-w-[200px] md:min-w-[260px]">
                        <Search className="text-gray-400 mr-2 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Receipt or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 focus:ring-0 text-sm"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-650 cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Summaries block */}
                <div className="flex items-center gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                    <div className="text-right">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Amount</span>
                        <span className="text-lg font-black text-gray-900">KES {totalAmountSum.toLocaleString()}</span>
                    </div>
                    <div className="text-right border-l pl-6 border-gray-200">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Sales Count</span>
                        <span className="text-lg font-black text-gray-900">{sales.length}</span>
                    </div>
                </div>
            </div>

            {/* Sales Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Loading sales records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold">Receipt</th>
                                    <th className="p-4 font-semibold">Customer</th>
                                    <th className="p-4 font-semibold">Items</th>
                                    <th className="p-4 font-semibold text-right">Amount</th>
                                    <th className="p-4 font-semibold">Payment</th>
                                    <th className="p-4 font-semibold">Time</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sales.map((sale) => (
                                    <tr key={sale.sale_id} className="hover:bg-gray-50 transition-colors duration-150 text-gray-900">
                                        <td className="p-4 font-semibold font-mono text-gray-800">
                                            {sale.receipt_number || `RCP-${sale.sale_id}`}
                                        </td>
                                        <td className="p-4">
                                            {sale.customer_name || "Walk-in customer"}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {sale.items_count} {Number(sale.items_count) === 1 ? "item" : "items"}
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900">
                                            KES {Number(sale.total || 0).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={getPaymentBadgeClass(sale.payment_method)}>
                                                {formatPaymentMethod(sale.payment_method)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {formatDate(sale.date_time)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleViewDetails(sale)}
                                                className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {sales.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center p-12 text-gray-400 bg-gray-50">
                                            No sales transactions found matching the selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Receipt Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl text-gray-900">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span>Receipt Details</span>
                            </h3>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSaleDetails(null);
                                }}
                                className="text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            
                            {/* Receipt Summary Grid */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-150 text-sm">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase block">Receipt No</span>
                                    <span className="font-mono font-bold text-gray-800 text-sm">
                                        {selectedSale?.receipt_number || `RCP-${selectedSale?.sale_id}`}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase block">Customer Name</span>
                                    <span className="font-medium text-gray-800 text-sm">
                                        {selectedSale?.customer_name || "Walk-in customer"}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase block">Date & Time</span>
                                    <span className="text-gray-805 text-xs">
                                        {formatDate(selectedSale?.date_time)}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase block">Payment Method</span>
                                    <span className="text-gray-800 font-semibold text-sm">
                                        {formatPaymentMethod(selectedSale?.payment_method)}
                                    </span>
                                </div>
                            </div>

                            {/* Items List Table */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction Items</h4>
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    {loadingDetails ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <p className="text-sm">Retrieving items...</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200 text-left text-gray-500 text-xs">
                                                <tr>
                                                    <th className="p-3 font-semibold">Product</th>
                                                    <th className="p-3 font-semibold text-center">Qty</th>
                                                    <th className="p-3 font-semibold text-right">Price</th>
                                                    <th className="p-3 font-semibold text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-150 text-gray-900">
                                                {saleDetails?.items?.map((item) => (
                                                    <tr key={item.sale_item_id}>
                                                        <td className="p-3 font-medium">
                                                            {item.product_name || `Product ID: ${item.product_id}`}
                                                        </td>
                                                        <td className="p-3 text-center text-gray-650">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="p-3 text-right text-gray-600">
                                                            KES {Number(item.unit_price).toLocaleString()}
                                                        </td>
                                                        <td className="p-3 text-right font-semibold">
                                                            KES {(Number(item.quantity) * Number(item.unit_price)).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                
                                                {/* Total row */}
                                                <tr className="bg-gray-50 font-bold border-t border-gray-200 text-base">
                                                    <td colSpan="3" className="p-3 text-gray-900">Grand Total</td>
                                                    <td className="p-3 text-right text-blue-700">
                                                        KES {Number(saleDetails?.total || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSaleDetails(null);
                                }}
                                className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold border border-gray-300 rounded-lg text-sm transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default SalesHistoryPage;
