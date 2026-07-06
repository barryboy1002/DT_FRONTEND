import React, { useState, useEffect } from "react";
import { 
    Users, 
    UserPlus, 
    Mail, 
    Shield, 
    MapPin, 
    X, 
    Loader2,
    Lock
} from "lucide-react";
import { getUsers, createUser } from "../api/authApi";
import { getBranches } from "../api/branchesApi";
import { useAuth } from "../context/AuthContext";

function StaffPage() {
    const { user: currentUser } = useAuth();
    const [staff, setStaff] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "cashier",
        branchId: ""
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        setError("");
        try {
            const [usersRes, branchesRes] = await Promise.all([
                getUsers(),
                getBranches()
            ]);
            setStaff(usersRes.data || []);
            setBranches(branchesRes.data || []);
        } catch (err) {
            console.error("Failed to load staff/branches data", err);
            setError("Could not load staff data. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    function handleOpenCreate() {
        setFormData({
            name: "",
            email: "",
            password: "",
            role: currentUser?.role === "manager" ? "cashier" : "cashier",
            branchId: currentUser?.role === "manager" ? currentUser?.branch_id || "" : (branches[0]?.branch_id || "")
        });
        setIsOpen(true);
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError("All fields are required.");
            return;
        }

        // Quick basic validation
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setSubmitting(true);
        try {
            await createUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                branchId: formData.branchId || null
            });
            setSuccessMsg("Staff member added successfully!");
            setIsOpen(false);
            loadData();
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("Failed to create staff member", err);
            setError(err?.response?.data?.error || err?.response?.data?.message || "Failed to add staff member. Check password strength (must include upper/lowercase, number, and symbol).");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
                    <p className="text-sm text-slate-500">Manage user roles (owners, managers, cashiers) and their assigned branches</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md transition-colors duration-200"
                >
                    <UserPlus size={18} />
                    Add Staff Member
                </button>
            </div>

            {/* Notification Messages */}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3 animate-fade-in">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{successMsg}</span>
                </div>
            )}
            
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>{error}</span>
                </div>
            )}

            {/* Data Table */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <span className="text-slate-500 font-medium">Fetching staff list...</span>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Assigned Branch</th>
                                    <th className="px-6 py-4">Registered Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {staff.map((member) => (
                                    <tr key={member.user_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {member.name}
                                            {member.user_id === currentUser?.user_id && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            {member.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                                member.role === "owner" 
                                                    ? "bg-purple-50 text-purple-700 border border-purple-100" 
                                                    : member.role === "manager" 
                                                    ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                            }`}>
                                                <Shield size={12} />
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {member.role === "owner" ? (
                                                <span className="text-slate-400 italic">All Branches</span>
                                            ) : member.branch_name ? (
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {member.branch_name}
                                                </span>
                                            ) : (
                                                <span className="text-rose-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(member.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Dialog */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-scale-up">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">
                                Add Staff Member
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
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Email Address <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. johndoe@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 flex justify-between">
                                    <span>Password <span className="text-rose-500">*</span></span>
                                    <span className="text-slate-400 text-xs flex items-center gap-0.5 font-normal"><Lock size={12}/> Min. 8 chars (1 upper, 1 sym, 1 num)</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Role <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    disabled={currentUser?.role === "manager"}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                >
                                    <option value="cashier">Cashier</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Assign Branch <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    disabled={currentUser?.role === "manager"}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                >
                                    {currentUser?.role === "manager" ? (
                                        <option value={currentUser.branch_id}>
                                            {branches.find(b => b.branch_id === currentUser.branch_id)?.name || "Current Branch"}
                                        </option>
                                    ) : (
                                        <>
                                            <option value="">Select Branch...</option>
                                            {branches.map(b => (
                                                <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                                            ))}
                                        </>
                                    )}
                                </select>
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
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StaffPage;
