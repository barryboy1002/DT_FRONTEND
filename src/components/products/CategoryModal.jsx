import { useState } from "react";
import { Plus, Tag, Trash2, X } from "lucide-react";

function CategoryModal({
    isOpen,
    onClose,
    categories,
    onCreate,
    onDelete
}) {

    const [name, setName] =
        useState("");

    async function handleSubmit(e) {

        e.preventDefault();

        if (!name.trim()) return;

        await onCreate(name);

        setName("");
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Manage Categories</h2>
                        <p className="text-sm text-gray-500 mt-1">Organize products with clear, reusable groups.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 rounded-full p-2 hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
                        <div className="flex-1 flex items-center rounded-lg border border-gray-300 px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                            <Tag size={16} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Category name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border-none outline-none text-sm"
                            />
                        </div>
                        <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 rounded-lg font-semibold text-sm">
                            <Plus size={16} />
                            Add
                        </button>
                    </form>

                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {categories.map((category) => (
                            <div key={category.category_id} className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-3">
                                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                                <button
                                    onClick={() => onDelete(category.category_id)}
                                    className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryModal;