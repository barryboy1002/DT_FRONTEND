import { useState, useEffect } from "react";
import { Search, Plus, X, Eye, Calendar, DollarSign, Package, Truck, FileText } from "lucide-react";
import { getPurchases, getPurchase, createPurchase } from "../api/purchasesApi";
import { getProducts } from "../api/productsApi";
import { getSuppliers } from "../api/suppliersApi";
import { useAppSettings } from "../context/AppSettingsContext";

function PurchasesPage() {
    const { purchaseFilters, setPurchaseFilters } = useAppSettings();

    const [purchases, setPurchases] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [from, setFrom] = useState(purchaseFilters.from || "");
    const [to, setTo] = useState(purchaseFilters.to || "");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [purchaseDetails, setPurchaseDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Form states
    const [supplierId, setSupplierId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [dateArrived, setDateArrived] = useState("");
    const [purchaseItems, setPurchaseItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Product search for adding items
    const [productSearch, setProductSearch] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    async function loadPurchases(params = {}) {
        setLoading(true);
        try {
            const queryParams = {};
            if (params.from) queryParams.from = params.from;
            if (params.to) queryParams.to = params.to;
            if (params.supplier_id) queryParams.supplier_id = params.supplier_id;

            const response = await getPurchases(queryParams);
            setPurchases(response.data || []);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to retrieve purchase records.");
        } finally {
            setLoading(false);
        }
    }

    async function loadProducts() {
        setLoadingProducts(true);
        try {
            const response = await getProducts({});
            setProducts(response.data || []);
            setFilteredProducts(response.data || []);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to load products.");
        } finally {
            setLoadingProducts(false);
        }
    }

    async function loadSuppliers() {
        setLoadingSuppliers(true);
        try {
            const response = await getSuppliers({});
            setSuppliers(response.data || []);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to load suppliers.");
        } finally {
            setLoadingSuppliers(false);
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
        setPurchaseFilters({ from, to });
    }, [from, to, setPurchaseFilters]);

    // Load initial data
    useEffect(() => {
        loadPurchases({ from, to });
        loadProducts();
        loadSuppliers();
    }, [from, to]);

    useEffect(() => {
        const handleProductsUpdated = () => loadProducts();
        window.addEventListener("dukatrack:products-updated", handleProductsUpdated);
        return () => window.removeEventListener("dukatrack:products-updated", handleProductsUpdated);
    }, []);

    // Filter products for modal
    useEffect(() => {
        if (productSearch.trim()) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.barcode && p.barcode.includes(productSearch))
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [productSearch, products]);

    const handleViewDetails = async (purchase) => {
        setSelectedPurchase(purchase);
        setShowDetailsModal(true);
        setLoadingDetails(true);
        setPurchaseDetails(null);
        try {
            const res = await getPurchase(purchase.purchases_id);
            setPurchaseDetails(res.data);
        } catch (err) {
            console.error(err);
            setErrorMsg("Could not fetch purchase details.");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleOpenAddModal = () => {
        setShowAddModal(true);
        setSupplierId("");
        setPaymentMethod("cash");
        setDateArrived("");
        setPurchaseItems([]);
        setProductSearch("");
        setErrorMsg("");
        // Products and suppliers already loaded on mount
    };

    const addItemToPurchase = (product) => {
        const existingItem = purchaseItems.find(item => item.product_id === product.product_id);
        if (existingItem) {
            setPurchaseItems(purchaseItems.map(item =>
                item.product_id === product.product_id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setPurchaseItems([...purchaseItems, {
                product_id: product.product_id,
                product_name: product.name,
                quantity: 1,
                unit_price: 0
            }]);
        }
    };

    const updateItemQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            setPurchaseItems(purchaseItems.filter(item => item.product_id !== productId));
        } else {
            setPurchaseItems(purchaseItems.map(item =>
                item.product_id === productId
                    ? { ...item, quantity }
                    : item
            ));
        }
    };

    const updateItemCost = (productId, cost) => {
        setPurchaseItems(purchaseItems.map(item =>
            item.product_id === productId
                ? { ...item, unit_price: Number(cost) || 0 }
                : item
        ));
    };

    const removeItem = (productId) => {
        setPurchaseItems(purchaseItems.filter(item => item.product_id !== productId));
    };

    const handleSubmitPurchase = async () => {
        if (!supplierId || supplierId === "") {
            setErrorMsg("Please select a supplier.");
            return;
        }
        if (purchaseItems.length === 0) {
            setErrorMsg("Add at least one item to the purchase.");
            return;
        }
        if (purchaseItems.some(item => item.unit_price <= 0)) {
            setErrorMsg("All items must have a valid unit cost.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");
        try {
            const payload = {
                supplier_id: supplierId,
                payment_method: paymentMethod,
                date_arrived: dateArrived || null,
                items: purchaseItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                }))
            };

            await createPurchase(payload);
            setSuccessMsg("Purchase recorded successfully!");
            setShowAddModal(false);
            loadPurchases({ from, to });
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.error || "Failed to record purchase.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate statistics
    const totalPurchases = purchases.length;
    const totalAmount = purchases.reduce((sum, p) => sum + Number(p.total || 0), 0);

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateStr;
        }
    };

    const purchaseTotal = purchaseItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto text-gray-900">
            
            {/* Header Area */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Purchases</h1>
                    <p className="text-gray-500 mt-1">Manage inventory purchases and supplier transactions</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Purchase</span>
                </button>
            </div>

            {/* Success banner */}
            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3 relative shadow-sm">
                    <Package className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm">Success</h4>
                        <p className="text-xs mt-1 text-green-700">{successMsg}</p>
                    </div>
                    <button
                        onClick={() => setSuccessMsg("")}
                        className="absolute top-4 right-4 text-green-600 hover:text-green-800 cursor-pointer"
                    >
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

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Purchases</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalPurchases}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Amount</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">KES {totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
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
                </div>
            </div>

            {/* Purchases Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Loading purchase records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold">Purchase ID</th>
                                    <th className="p-4 font-semibold">Supplier</th>
                                    <th className="p-4 font-semibold">Items</th>
                                    <th className="p-4 font-semibold text-right">Total Amount</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {purchases.map((purchase) => (
                                    <tr key={purchase.purchases_id} className="hover:bg-gray-50 transition-colors duration-150 text-gray-900">
                                        <td className="p-4 font-semibold font-mono text-gray-800">
                                            #{purchase.purchases_id}
                                        </td>
                                        <td className="p-4">
                                            {purchase.supplier_name || "Unknown Supplier"}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {purchase.items_count} {Number(purchase.items_count) === 1 ? "item" : "items"}
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900">
                                            KES {Number(purchase.total || 0).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {formatDate(purchase.date_ordered)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleViewDetails(purchase)}
                                                className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {purchases.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center p-12 text-gray-400 bg-gray-50">
                                            No purchase records found matching the selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Purchase Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl text-gray-900 max-h-[90vh] flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                <Plus className="h-5 w-5 text-blue-600" />
                                <span>New Purchase</span>
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            
                            {/* Supplier */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Supplier *</label>
                                {loadingSuppliers ? (
                                    <div className="text-sm text-gray-400 py-2">Loading suppliers...</div>
                                ) : (
                                    <select
                                        value={supplierId}
                                        onChange={(e) => setSupplierId(e.target.value)}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    >
                                        <option value="">Select a supplier</option>
                                        {suppliers.map(supplier => (
                                            <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Payment Method *</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="mpesa">M-Pesa</option>
                                    <option value="credit">Credit</option>
                                </select>
                            </div>

                            {/* Date Arrived */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Date Arrived (Optional)</label>
                                <input
                                    type="date"
                                    value={dateArrived}
                                    onChange={(e) => setDateArrived(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>

                            {/* Product Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Add Products</label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                    <Search className="text-gray-400 mr-2 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 focus:ring-0 text-sm"
                                    />
                                </div>
                                
                                {/* Product List */}
                                <div className="max-h-[150px] overflow-y-auto border border-gray-200 rounded-lg">
                                    {loadingProducts ? (
                                        <div className="text-center py-4 text-gray-400">Loading products...</div>
                                    ) : (
                                        <>
                                            {filteredProducts.map(product => (
                                                <button
                                                    key={product.product_id}
                                                    onClick={() => addItemToPurchase(product)}
                                                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors cursor-pointer flex justify-between items-center"
                                                >
                                                    <span className="text-sm text-gray-900">{product.name}</span>
                                                    <Plus className="h-4 w-4 text-blue-600" />
                                                </button>
                                            ))}
                                            {filteredProducts.length === 0 && (
                                                <div className="text-center py-4 text-gray-400 text-sm">No products found</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Purchase Items */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Purchase Items ({purchaseItems.length})</label>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    {purchaseItems.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            No items added yet. Search and add products above.
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold text-gray-700">Product</th>
                                                    <th className="p-3 text-center font-semibold text-gray-700">Quantity</th>
                                                    <th className="p-3 text-right font-semibold text-gray-700">Unit Cost</th>
                                                    <th className="p-3 text-right font-semibold text-gray-700">Total</th>
                                                    <th className="p-3 text-center font-semibold text-gray-700">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {purchaseItems.map(item => (
                                                    <tr key={item.product_id}>
                                                        <td className="p-3 text-gray-900">{item.product_name}</td>
                                                        <td className="p-3">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItemQuantity(item.product_id, Number(e.target.value))}
                                                                className="w-20 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unit_price}
                                                                onChange={(e) => updateItemCost(item.product_id, e.target.value)}
                                                                className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-sm"
                                                                placeholder="0.00"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-right font-semibold text-gray-900">
                                                            KES {(item.quantity * item.unit_price).toLocaleString()}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => removeItem(item.product_id)}
                                                                className="text-red-600 hover:text-red-700 cursor-pointer"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                                <tr>
                                                    <td colSpan="3" className="p-3 text-right font-bold text-gray-900">Total Purchase Amount:</td>
                                                    <td className="p-3 text-right font-bold text-blue-700 text-base">
                                                        KES {purchaseTotal.toLocaleString()}
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold border border-gray-300 rounded-lg text-sm transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitPurchase}
                                disabled={isSubmitting || purchaseItems.length === 0}
                                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                                    isSubmitting || purchaseItems.length === 0
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                }`}
                            >
                                {isSubmitting ? "Recording..." : "Record Purchase"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl text-gray-900">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span>Purchase Details</span>
                            </h3>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setPurchaseDetails(null);
                                }}
                                className="text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            
                            {/* Purchase Summary */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-150 text-sm">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase block">Purchase ID</span>
                                    <span className="font-mono font-bold text-gray-800 text-sm">
                                        #{selectedPurchase?.purchases_id}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase block">Supplier</span>
                                    <span className="font-medium text-gray-800 text-sm">
                                        {selectedPurchase?.supplier_name || "Unknown"}
                                    </span>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase block">Purchase Date</span>
                                    <span className="text-gray-805 text-xs">
                                        {formatDate(selectedPurchase?.date_ordered)}
                                    </span>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Purchase Items</h4>
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    {loadingDetails ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <p className="text-sm">Loading items...</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200 text-left text-gray-500 text-xs">
                                                <tr>
                                                    <th className="p-3 font-semibold">Product</th>
                                                    <th className="p-3 font-semibold text-center">Quantity</th>
                                                    <th className="p-3 font-semibold text-right">Unit Cost</th>
                                                    <th className="p-3 font-semibold text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-150 text-gray-900">
                                                {purchaseDetails?.items?.map((item) => (
                                                    <tr key={item.purchase_item_id}>
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
                                                    <td colSpan="3" className="p-3 text-gray-900">Total Amount</td>
                                                    <td className="p-3 text-right text-blue-700">
                                                        KES {Number(purchaseDetails?.total || 0).toLocaleString()}
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
                                    setPurchaseDetails(null);
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

export default PurchasesPage;
