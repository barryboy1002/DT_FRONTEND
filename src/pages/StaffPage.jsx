import React, { useState, useEffect } from "react";
import {
    UserPlus,
    Mail,
    Shield,
    MapPin,
    X,
    Loader2,
    Lock,
    Pencil,
    Trash2
} from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "../api/authApi";
import { getBranches } from "../api/branchesApi";
import { useAuth } from "../context/AuthContext";

function StaffPage() {
    const { user: currentUser } = useAuth();
    const [staff, setStaff] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const canManageStaff = currentUser?.role === "owner";

    // Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
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
        setIsEdit(false);
        setCurrentUserId(null);
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "cashier",
            branchId: currentUser?.role === "manager" ? currentUser?.branch_id || "" : (branches[0]?.branch_id || "")
        });
        setIsOpen(true);
        setError("");
    }

    function handleOpenEdit(member) {
        setIsEdit(true);
        setCurrentUserId(member.user_id);
        setFormData({
            name: member.name,
            email: member.email,
            password: "",
            role: member.role,
            branchId: member.branch_id || ""
        });
        setIsOpen(true);
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        
        if (!formData.name.trim() || !formData.email.trim()) {
            setError("Name and email are required.");
            return;
        }

        if (!isEdit && !formData.password.trim()) {
            setError("Password is required for new staff members.");
            return;
        }

        if (!isEdit && formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setSubmitting(true);
        try {
            if (isEdit) {
                await updateUser(currentUserId, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    branch_id: formData.branchId || null
                });
                setSuccessMsg("Staff member updated successfully!");
            } else {
                await createUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    branchId: formData.branchId || null
                });
                setSuccessMsg("Staff member added successfully!");
            }
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

    async function handleDelete(memberId) {
        if (!window.confirm("Delete this staff member?")) return;

        try {
            await deleteUser(memberId);
            setSuccessMsg("Staff member removed successfully.");
            loadData();
        } catch (err) {
            console.error("Failed to delete staff member", err);
            setError(err?.response?.data?.error || "Failed to remove staff member.");
        }
    }

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto text-gray-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff</h1>
                    <p className="text-gray-500 mt-1">Manage users and their branch access in one place.</p>
                </div>
                {canManageStaff && (
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-colors duration-200"
                    >
                        <UserPlus size={18} />
                        Add Staff Member
                    </button>
                )}
            </div>

            {/* Notification Messages */}
            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <Shield size={16} className="mt-0.5" />
                    <span>{successMsg}</span>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <X size={16} className="mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Data Table */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span className="text-gray-500 font-medium">Fetching staff list...</span>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Assigned Branch</th>
                                    <th className="px-6 py-4">Registered Date</th>
                                    {canManageStaff && <th className="px-6 py-4 text-right">Actions</th>}
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
                                        {canManageStaff && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleOpenEdit(member)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-blue-200 hover:text-blue-600" title="Edit staff">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(member.user_id)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-red-200 hover:text-red-600" title="Delete staff">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
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

                            {!isEdit && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1 flex justify-between">
                                        <span>Password <span className="text-rose-500">*</span></span>
                                        <span className="text-slate-400 text-xs flex items-center gap-0.5 font-normal"><Lock size={12}/> Min. 8 chars</span>
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
                            )}

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
                                    {isEdit ? "Save Changes" : "Create Account"}
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
