import { useEffect, useState } from "react";
import { createPurchase } from "../api/purchasesApi";
import { getSuppliers } from "../api/suppliersApi";

// prefillProduct: { product_id, name } — when opened right after creating a product
function PurchaseModal({ isOpen, onClose, onSuccess, prefillProduct = null }) {
    const [suppliers, setSuppliers] = useState([]);
    const [supplierId, setSupplierId] = useState("");
    const [quantity, setQuantity] = useState(prefillProduct ? 1 : "");
    const [unitPrice, setUnitPrice] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [dateArrived, setDateArrived] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        getSuppliers()
            .then((res) => setSuppliers(res.data || []))
            .catch(() => setSuppliers([]));
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && prefillProduct) {
            setQuantity(1);
            setUnitPrice("");
        }
    }, [isOpen, prefillProduct]);

    if (!isOpen) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!supplierId) {
            setError("Please select a supplier.");
            return;
        }
        if (!quantity || Number(quantity) <= 0) {
            setError("Quantity must be greater than zero.");
            return;
        }
        if (!unitPrice || Number(unitPrice) <= 0) {
            setError("Unit price must be greater than zero.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                supplier_id: supplierId,
                payment_method: paymentMethod,
                date_arrived: dateArrived || null,
                items: [
                    {
                        product_id: prefillProduct.product_id,
                        quantity: Number(quantity),
                        unit_price: Number(unitPrice)
                    }
                ]
            };
            const res = await createPurchase(payload);
            onSuccess(res.data);
        } catch (err) {
            setError(err.userMessage || "Failed to record purchase.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">Record Initial Stock</h2>
                        {prefillProduct && (
                            <p className="text-sm text-gray-500 mt-1">
                                Add opening stock for <span className="font-medium">{prefillProduct.name}</span> from a supplier
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Supplier</label>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                        >
                            <option value="">Select supplier</option>
                            {suppliers.map((s) => (
                                <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                            ))}
                        </select>
                        {suppliers.length === 0 && (
                            <p className="mt-2 text-xs text-amber-600">
                                No suppliers yet — add one from the Suppliers page first.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">Quantity Received</label>
                            <input
                                type="number"
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">Unit Cost Price</label>
                            <input
                                type="number"
                                step="0.01"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2"
                            >
                                <option value="cash">Cash</option>
                                <option value="mpesa">M-Pesa</option>
                                <option value="credit">Credit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">Date Arrived</label>
                            <input
                                type="date"
                                value={dateArrived}
                                onChange={(e) => setDateArrived(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Skip for now
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70"
                        >
                            {isSubmitting ? "Saving…" : "Record Purchase"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PurchaseModal;
