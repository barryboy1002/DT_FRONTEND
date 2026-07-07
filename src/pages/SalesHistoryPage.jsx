import { useState, useEffect } from "react";
import { Search, X, Eye, FileText, RotateCcw } from "lucide-react";
import { getSales, getSale } from "../api/salesApi";
import { useAppSettings } from "../context/AppSettingsContext";

function SalesHistoryPage() {
    const { salesHistoryFilters, setSalesHistoryFilters } = useAppSettings();

    const [sales, setSales] = useState([]);
    const [from, setFrom] = useState(salesHistoryFilters.from || "");
    const [to, setTo] = useState(salesHistoryFilters.to || "");
    const [paymentMethod, setPaymentMethod] = useState(salesHistoryFilters.paymentMethod || ""); // empty means All Payments
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [meta, setMeta] = useState({ page: 1, limit: 10, total_pages: 1, total_items: 0 });
        // Detail Modal State
    const [selectedSale, setSelectedSale] = useState(null);
    const [saleDetails, setSaleDetails] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    async function loadSalesList(params = {}) {
        setLoading(true);
        try {
            const queryParams = {};
            if (params.from) queryParams.from = params.from;
            if (params.to) queryParams.to = params.to;
            if (params.paymentMethod) queryParams.payment_method = params.paymentMethod;
            if (params.search) queryParams.search = params.search;

            const response = await getSales({ ...queryParams, page, limit: pageSize });
            setSales(response.data || []);
            setMeta(response.meta || { page, limit: pageSize, total_pages: 1, total_items: 0 });
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

    useEffect(() => {
        setSalesHistoryFilters({ from, to, paymentMethod });
    }, [from, to, paymentMethod, setSalesHistoryFilters]);

    // Reload list when filters change
    useEffect(() => {
        setPage(1);
    }, [from, to, paymentMethod, debouncedSearch]);

    useEffect(() => {
        loadSalesList({
            from,
            to,
            paymentMethod,
            search: debouncedSearch
        });
    }, [from, to, paymentMethod, debouncedSearch, page, pageSize]);

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

            {/* Success banner */}
            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3 relative shadow-sm">
                    <FileText className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm">Success</h4>
                        <p className="text-xs mt-1 text-green-700">{successMsg}</p>
                    </div>
                    <button onClick={() => setSuccessMsg("")} className="absolute top-4 right-4 text-green-600 hover:text-green-800 cursor-pointer">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

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
                                            KES {Number(sale.total ||  0).toLocaleString()}
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
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-600">Showing {sales.length} of {meta.total_items} transactions</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                        <span className="text-sm text-gray-600">Page {meta.page || 1} of {meta.total_pages || 1}</span>
                        <button onClick={() => setPage((current) => current + 1)} disabled={page >= (meta.total_pages || 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>

            {/* Detail Receipt Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl text-gray-900">
                        
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span>Receipt</span>
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
                        <div className="p-6 space-y-4">
                            
                            {/* Receipt Header - Centered */}
                            <div className="text-center space-y-1 pb-4 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900">Sh-Track</h2>
                                <p className="text-sm text-gray-600">{formatDate(selectedSale?.date_time)}</p>
                                <p className="text-sm text-gray-700">
                                    Receipt: <span className="font-mono font-bold">{saleDetails?.receipt_number || selectedSale?.receipt_number || `RCP-${selectedSale?.sale_id}`}</span>
                                </p>
                                <p className="text-sm text-gray-700">
                                    Customer: <span className="font-medium">{selectedSale?.customer_name || "Walk-in"}</span>
                                </p>
                            </div>

                            {/* Items List */}
                            <div className="space-y-3">
                                {loadingDetails ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm">Retrieving items...</p>
                                    </div>
                                ) : (
                                    <>
                                        {saleDetails?.items?.map((item, index) => (
                                            <div key={item.sale_item_id} className="space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900 text-sm">
                                                            {item.product_name || `Product ID: ${item.product_id}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {item.quantity} x KSh {Number(item.unit_price).toLocaleString()}
                                                        </p>
                                                        {(item.barcode || item.product_id) && (
                                                            <p className="text-xs text-gray-400 font-mono">
                                                                {item.barcode ? `Barcode: ${item.barcode}` : `ID: ${item.product_id}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <p className="font-semibold text-gray-900 text-sm">
                                                        KSh {(Number(item.quantity) * Number(item.unit_price)).toLocaleString()}
                                                    </p>
                                                </div>
                                                {index < saleDetails.items.length - 1 && (
                                                    <div className="border-b border-gray-100 pt-2"></div>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {/* Subtotal and Total */}
                                        <div className="pt-3 border-t border-gray-200 space-y-2">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Subtotal</span>
                                                <span>KSh {Number(saleDetails?.total || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-base font-bold text-gray-900">
                                                <span>Total</span>
                                                <span>KSh {Number(saleDetails?.total || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
                                                <span>Payment</span>
                                                <span className="font-medium">{formatPaymentMethod(selectedSale?.payment_method)}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer Messages */}
                            <div className="text-center space-y-2 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">Thank you for your business!</p>
                                <p className="text-xs text-gray-400">Powered by Sh-Track</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                                        <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSaleDetails(null);
                                    setRefundReason("");
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default SalesHistoryPage;
