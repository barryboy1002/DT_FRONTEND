import { useState, useEffect } from "react";
import { Search, Plus, X, Edit2, Phone, Mail, FileText, Building2 } from "lucide-react";
import { getSuppliers, createSupplier, updateSupplier } from "../api/suppliersApi";

function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    // Form states
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [paymentTerms, setPaymentTerms] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    async function loadSuppliers(term = "") {
        setLoading(true);
        try {
            const response = await getSuppliers({ search: term });
            setSuppliers(response.data || []);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to load suppliers.");
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

    // Load initial data and reload when debounced search term changes
    useEffect(() => {
        loadSuppliers(debouncedSearch);
    }, [debouncedSearch]);

    const handleOpenModal = (supplier = null) => {
        setEditingSupplier(supplier);
        setName(supplier?.name || "");
        setPhone(supplier?.phone || "");
        setEmail(supplier?.email || "");
        setPaymentTerms(supplier?.payment_terms || "");
        setErrorMsg("");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
        setName("");
        setPhone("");
        setEmail("");
        setPaymentTerms("");
        setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim() || !phone.trim() || !email.trim()) {
            setErrorMsg("Name, phone, and email are required.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const payload = {
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
                payment_terms: paymentTerms.trim() || null
            };

            if (editingSupplier) {
                await updateSupplier(editingSupplier.supplier_id, payload);
                setSuccessMsg("Supplier updated successfully!");
            } else {
                await createSupplier(payload);
                setSuccessMsg("Supplier created successfully!");
            }

            handleCloseModal();
            await loadSuppliers(debouncedSearch);
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.error || "Failed to save supplier.");
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="space-y-6 max-w-[1440px] mx-auto text-gray-900">
            
            {/* Header Area */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Suppliers</h1>
                    <p className="text-gray-500 mt-1">Manage supplier contacts and payment terms</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Supplier</span>
                </button>
            </div>

            {/* Success banner */}
            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3 relative shadow-sm">
                    <Building2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
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
                        className="absolute top-4 right-4 text-red-600 hover:text-red-800 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Search Section */}
            <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm">
                <Search className="text-gray-400 mr-2 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search suppliers by name, phone, or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 focus:ring-0 text-sm"
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

            {/* Suppliers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Loading suppliers...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Contact</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold">Payment Terms</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {suppliers.map((supplier) => (
                                    <tr key={supplier.supplier_id} className="hover:bg-gray-50 transition-colors duration-150 text-gray-900">
                                        <td className="p-4 font-semibold">
                                            {supplier.name}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-4 w-4" />
                                                <span>{supplier.phone}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="h-4 w-4" />
                                                <span>{supplier.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {supplier.payment_terms || "—"}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleOpenModal(supplier)}
                                                className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                                                title="Edit Supplier"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {suppliers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center p-12 text-gray-400 bg-gray-50">
                                            No suppliers found. Add your first supplier to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Supplier Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl text-gray-900">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                {editingSupplier ? <Edit2 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
                                <span>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</span>
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Supplier Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter supplier name"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g., +254712345678"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="supplier@example.com"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* Payment Terms */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Payment Terms (Optional)</label>
                                <input
                                    type="text"
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                    placeholder="e.g., Net 30 days"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold border border-gray-300 rounded-lg text-sm transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                                        isSubmitting
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                    }`}
                                >
                                    {isSubmitting ? "Saving..." : editingSupplier ? "Update Supplier" : "Add Supplier"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default SuppliersPage;
