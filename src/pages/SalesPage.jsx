import { useState, useEffect } from "react";
import { Search, Scan, Plus, Trash2, Smartphone, Banknote, Check, AlertTriangle, X, ShoppingCart, Percent } from "lucide-react";
import { getProducts } from "../api/productsApi";
import { createSale } from "../api/salesApi";

function SalesPage() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Cart state
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cash"); // 'cash' or 'mpesa'
    const [customerName, setCustomerName] = useState("");
    
    // UI state
    const [isCompleting, setIsCompleting] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [saleSuccess, setSaleSuccess] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    async function loadData(term = "") {
        setLoading(true);
        try {
            const productsResponse = await getProducts({ search: term });
            setProducts(productsResponse.data || []);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to load products from server.");
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

    // Reload products when debounced search term changes
    useEffect(() => {
        loadData(debouncedSearch);
    }, [debouncedSearch]);

    const addToCart = (product) => {
        setErrorMsg("");
        setSaleSuccess(null);
        
        // Check if item is already in cart
        const existingItem = cart.find(item => item.product_id === product.product_id);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        
        // Check stock limit
        if (currentQtyInCart >= Number(product.stock_quantity)) {
            setErrorMsg(`Cannot add more of ${product.name}. Insufficient stock.`);
            return;
        }
        
        if (existingItem) {
            setCart(cart.map(item => 
                item.product_id === product.product_id 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateCartQuantity = (productId, qty) => {
        setErrorMsg("");
        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }
        
        // Find product to check stock limit
        const product = products.find(p => p.product_id === productId);
        if (product && qty > Number(product.stock_quantity)) {
            setErrorMsg(`Cannot set quantity to ${qty} for ${product.name}. Insufficient stock.`);
            return;
        }
        
        setCart(cart.map(item => 
            item.product_id === productId 
                ? { ...item, quantity: qty }
                : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setDiscount(0);
        setCustomerName("");
        setPaymentMethod("cash");
        setErrorMsg("");
    };

    const subtotal = cart.reduce((sum, item) => sum + Number(item.selling_price) * item.quantity, 0);
    const discountAmount = subtotal * (Number(discount) / 100);
    const total = subtotal - discountAmount;

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            setErrorMsg("Cart is empty.");
            return;
        }
        
        setIsCompleting(true);
        setErrorMsg("");
        setSaleSuccess(null);
        
        try {
            const payload = {
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: Number(item.selling_price)
                })),
                payment_method: paymentMethod,
                customer_name: customerName.trim() || "Walk-in customer"
            };
            
            const res = await createSale(payload);
            setSaleSuccess(res.data);
            clearCart();
            // Refresh products to show updated stock values
            await loadData(debouncedSearch);
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.error || "Failed to complete sale.");
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="-m-6 bg-slate-900 text-white min-h-[calc(100vh-4rem)] p-6 flex flex-col gap-6">
            
            {/* Header Area */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">New Sale</h1>
            </div>

            {/* Notification Banner Overlay */}
            {saleSuccess && (
                <div className="bg-emerald-950 border border-emerald-800 text-emerald-200 p-4 rounded-xl flex items-start gap-3 relative animate-slide-in shadow-lg">
                    <Check className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm">Sale Completed Successfully!</h4>
                        <p className="text-xs mt-1 text-emerald-300">
                            Receipt Number: <span className="font-mono font-bold bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-100">{saleSuccess.receipt_number}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setSaleSuccess(null)}
                        className="absolute top-4 right-4 text-emerald-400 hover:text-emerald-200 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {errorMsg && (
                <div className="bg-rose-950 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-start gap-3 relative animate-slide-in shadow-lg">
                    <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm">Action Failed</h4>
                        <p className="text-xs mt-1 text-rose-300">{errorMsg}</p>
                    </div>
                    <button
                        onClick={() => setErrorMsg("")}
                        className="absolute top-4 right-4 text-rose-400 hover:text-rose-200 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Two-Column Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Side: Product Browsing & Search */}
                <div className="lg:col-span-2 space-y-4">
                    
                    {/* Search & Scan Action Bar */}
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 flex items-center bg-white rounded-lg shadow px-4 py-2.5 border border-gray-200">
                            <Search className="text-gray-400 mr-2 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search product or scan barcode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 focus:ring-0 text-sm"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowScanModal(true)}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-700 transition-all font-semibold text-sm cursor-pointer shadow-sm hover:shadow"
                        >
                            <Scan className="h-4 w-4" />
                            <span>Scan</span>
                        </button>
                    </div>

                    {/* Products Grid list */}
                    {loading ? (
                        <div className="text-center py-12 text-gray-400 bg-slate-800/50 rounded-xl border border-slate-800">
                            <p>Loading products...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {products.map(product => {
                                const unitStr = product.unit || "pcs";
                                const isLowStock = Number(product.stock_quantity) <= Number(product.low_stock_threshhold);
                                
                                return (
                                    <div key={product.product_id} className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-base">{product.name}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                <span>{product.category_name || "Uncategorized"}</span>
                                                <span>•</span>
                                                <span className={isLowStock ? "text-rose-600 font-bold flex items-center gap-1.5" : "text-gray-500"}>
                                                    {product.stock_quantity} {unitStr} left
                                                    {isLowStock && (
                                                        <span className="bg-rose-50 text-rose-600 text-xxs px-1.5 py-0.5 rounded font-bold border border-rose-100">
                                                            ⚠️ Low
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-green-600 font-black text-lg">KSh {product.selling_price}</span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={Number(product.stock_quantity) <= 0}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-1 cursor-pointer ${
                                                    Number(product.stock_quantity) <= 0
                                                        ? "bg-gray-105 text-gray-400 cursor-not-allowed border border-gray-200"
                                                        : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
                                                }`}
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span>Add</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {products.length === 0 && (
                                <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-800">
                                    <p className="text-gray-400">No products found matching the criteria.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Current Sale Cart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-800 flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-gray-600" />
                            <span>Current Sale</span>
                        </h2>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto max-h-[300px] min-h-[120px] space-y-3 pr-1">
                        {cart.map(item => (
                            <div key={item.product_id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                <div className="flex-1 pr-2">
                                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                                    <span className="text-gray-500 text-xs">KSh {item.selling_price} each</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                        <button
                                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                                            className="px-2 py-1 hover:bg-gray-200 text-gray-600 font-bold transition-colors cursor-pointer"
                                        >
                                            -
                                        </button>
                                        <span className="px-2 text-xs font-semibold text-gray-800">{item.quantity}</span>
                                        <button
                                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                                            className="px-2 py-1 hover:bg-gray-200 text-gray-600 font-bold transition-colors cursor-pointer"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm min-w-[70px] text-right">
                                        KSh {Number(item.selling_price) * item.quantity}
                                    </span>
                                    <button
                                        onClick={() => removeFromCart(item.product_id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col justify-center items-center">
                                <ShoppingCart className="h-8 w-8 text-gray-300 mb-2" />
                                <p className="text-sm">Cart is empty</p>
                            </div>
                        )}
                    </div>

                    {/* Cart Calculations */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-gray-800">KSh {subtotal}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Discount</span>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 px-2 py-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discount || ""}
                                    onChange={(e) => {
                                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                        setDiscount(val);
                                    }}
                                    className="w-12 text-right bg-transparent border-none outline-none text-sm text-gray-800 focus:ring-0 font-semibold"
                                    placeholder="0"
                                />
                                <Percent className="h-3.5 w-3.5 text-gray-400 ml-1" />
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-bold text-base text-gray-900">Total</span>
                            <span className="font-black text-xl text-gray-900">KSh {total}</span>
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("cash")}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border font-semibold text-sm transition-all cursor-pointer ${
                                    paymentMethod === "cash"
                                        ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <Banknote className="h-4 w-4" />
                                <span>Cash</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("mpesa")}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border font-semibold text-sm transition-all cursor-pointer ${
                                    paymentMethod === "mpesa"
                                        ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <Smartphone className="h-4 w-4" />
                                <span>M-Pesa</span>
                            </button>
                        </div>
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Customer Name (Optional)</label>
                        <input
                            type="text"
                            placeholder="Walk-in customer"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-500 transition-colors"
                        />
                    </div>

                    {/* Complete Sale Button */}
                    <button
                        type="button"
                        onClick={handleCompleteSale}
                        disabled={cart.length === 0 || isCompleting}
                        className={`w-full py-3.5 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
                            cart.length === 0 || isCompleting
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                : "bg-green-650 hover:bg-green-700 text-white hover:shadow-md cursor-pointer"
                        }`}
                    >
                        {isCompleting ? (
                            <span>Processing...</span>
                        ) : (
                            <>
                                <Check className="h-5 w-5" />
                                <span>Complete Sale</span>
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* Simulated Scanner Modal */}
            {showScanModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-white">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <Scan className="h-5 w-5 text-green-400" />
                                <span>Scan Barcode Simulation</span>
                            </h3>
                            <button
                                onClick={() => setShowScanModal(false)}
                                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-400 mb-4">
                                Click on any product below to simulate scanning its barcode with a hardware or camera scanner.
                            </p>
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                                {products.filter(p => p.barcode).map(p => (
                                    <button
                                        key={p.product_id}
                                        onClick={() => {
                                            addToCart(p);
                                            setShowScanModal(false);
                                        }}
                                        className="w-full text-left p-3.5 hover:bg-slate-800 rounded-xl border border-slate-800 flex justify-between items-center transition-all hover:border-slate-700 cursor-pointer"
                                    >
                                        <div>
                                            <span className="font-bold block text-white text-sm">{p.name}</span>
                                            <span className="text-xs text-gray-400 font-mono">Barcode: {p.barcode}</span>
                                        </div>
                                        <span className="text-xs bg-green-950 text-green-400 px-2.5 py-1 rounded-full font-bold border border-green-900/50">
                                            Scan
                                        </span>
                                    </button>
                                ))}
                                {products.filter(p => p.barcode).length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No products have barcodes registered.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default SalesPage;