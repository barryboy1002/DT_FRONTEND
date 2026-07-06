import React, { useState, useEffect } from "react";
import {
    Building,
    MapPin,
    Phone,
    Plus,
    Edit,
    Trash2,
    X,
    Loader2
} from "lucide-react";
import { getBranches, createBranch, updateBranch, deleteBranch } from "../api/branchesApi";

function BranchesPage() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    
    // Modal states
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentBranchId, setCurrentBranchId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        phone: ""
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadBranches();
    }, []);

    async function loadBranches() {
        setLoading(true);
        try {
            const res = await getBranches();
            setBranches(res.data || []);
            setError("");
        } catch (err) {
            console.error("Failed to load branches", err);
            setError("Could not load branches. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleOpenCreate() {
        setIsEdit(false);
        setFormData({ name: "", location: "", phone: "" });
        setIsOpen(true);
        setError("");
    }

    function handleOpenEdit(branch) {
        setIsEdit(true);
        setCurrentBranchId(branch.branch_id);
        setFormData({
            name: branch.name,
            location: branch.location || "",
            phone: branch.phone || ""
        });
        setIsOpen(true);
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError("Branch name is required.");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            if (isEdit) {
                await updateBranch(currentBranchId, formData);
                setSuccessMsg("Branch updated successfully!");
            } else {
                await createBranch(formData);
                setSuccessMsg("Branch created successfully!");
            }
            setIsOpen(false);
            loadBranches();
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("Branch action failed", err);
            setError(err?.response?.data?.error || "An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(branchId) {
        if (!window.confirm("Are you sure you want to delete this branch? Users assigned to this branch will remain active but won't be associated with a branch.")) {
            return;
        }

        try {
            await deleteBranch(branchId);
            setSuccessMsg("Branch deleted successfully!");
            loadBranches();
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("Delete branch failed", err);
            setError("Could not delete branch. Please try again.");
        }
    }

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto text-gray-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Branches</h1>
                    <p className="text-gray-500 mt-1">Manage your physical outlets and keep staff assignments aligned.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-colors duration-200"
                >
                    <Plus size={18} />
                    Add Branch
                </button>
            </div>

            {/* Notification Messages */}
            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <Building size={16} className="mt-0.5" />
                    <span>{successMsg}</span>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <X size={16} className="mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Content Area */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span className="text-gray-500 font-medium">Fetching branches...</span>
                </div>
            ) : branches.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center max-w-xl mx-auto shadow-sm">
                    <div className="bg-blue-50 p-4 rounded-full inline-block mb-4 text-blue-600">
                        <Building size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No branches yet</h3>
                    <p className="text-gray-500 mb-6">Create your first outlet so sales, staff, and inventory stay organized.</p>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors duration-200"
                    >
                        Create first branch
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map((branch) => (
                        <div 
                            key={branch.branch_id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                                        <Building size={20} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(branch)}
                                            className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                                            title="Edit Branch"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(branch.branch_id)}
                                            className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                                            title="Delete Branch"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold text-lg text-gray-900">{branch.name}</h3>
                                    
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                                            <MapPin size={15} className="text-gray-400" />
                                            <span>{branch.location || "No location set"}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                                            <Phone size={15} className="text-gray-400" />
                                            <span>{branch.phone || "No contact set"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span>ID: {branch.branch_id.substring(0, 8)}...</span>
                                <span>Created {new Date(branch.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Dialog */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-scale-up">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {isEdit ? "Edit Branch" : "Add New Branch"}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Branch Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Downtown Nairobi, Westlands Hub"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Location / Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Kimathi Street, 2nd Floor"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Contact Phone Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. +254 700 000 000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm transition-colors disabled:bg-indigo-400"
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    {isEdit ? "Save Changes" : "Create Branch"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BranchesPage;
