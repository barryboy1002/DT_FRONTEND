import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../api/categoriesApi";
import { createSupplier } from "../api/suppliersApi";

const STEPS = ["welcome", "category", "supplier", "done"];

function OnboardingWizard() {
    const navigate = useNavigate();
    const [stepIndex, setStepIndex] = useState(0);
    const step = STEPS[stepIndex];

    const [categoryName, setCategoryName] = useState("");
    const [categoriesCreated, setCategoriesCreated] = useState([]);
    const [categoryError, setCategoryError] = useState("");
    const [savingCategory, setSavingCategory] = useState(false);

    const [supplierName, setSupplierName] = useState("");
    const [supplierPhone, setSupplierPhone] = useState("");
    const [supplierEmail, setSupplierEmail] = useState("");
    const [suppliersCreated, setSuppliersCreated] = useState([]);
    const [supplierError, setSupplierError] = useState("");
    const [savingSupplier, setSavingSupplier] = useState(false);

    const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    const skip = () => goNext();

    async function handleAddCategory(e) {
        e.preventDefault();
        if (!categoryName.trim()) return;
        setSavingCategory(true);
        setCategoryError("");
        try {
            await createCategory({ name: categoryName.trim() });
            setCategoriesCreated((prev) => [...prev, categoryName.trim()]);
            setCategoryName("");
        } catch (err) {
            setCategoryError(err.userMessage || "Failed to create category.");
        } finally {
            setSavingCategory(false);
        }
    }

    async function handleAddSupplier(e) {
        e.preventDefault();
        if (!supplierName.trim()) return;
        setSavingSupplier(true);
        setSupplierError("");
        try {
            await createSupplier({
                name: supplierName.trim(),
                phone: supplierPhone.trim(),
                email: supplierEmail.trim()
            });
            setSuppliersCreated((prev) => [...prev, supplierName.trim()]);
            setSupplierName("");
            setSupplierPhone("");
            setSupplierEmail("");
        } catch (err) {
            setSupplierError(err.userMessage || "Failed to create supplier.");
        } finally {
            setSavingSupplier(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {STEPS.map((s, i) => (
                        <div
                            key={s}
                            className={`h-1.5 w-10 rounded-full ${i <= stepIndex ? "bg-blue-600" : "bg-gray-200"}`}
                        />
                    ))}
                </div>

                {step === "welcome" && (
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold text-slate-900">Welcome to DukaTrack 🎉</h1>
                        <p className="text-slate-500">
                            Let's get your shop set up. It'll only take a minute — we'll add a category
                            and a supplier so you're ready to add your first products.
                        </p>
                        <button
                            onClick={goNext}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
                        >
                            Let's go
                        </button>
                    </div>
                )}

                {step === "category" && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Add a product category</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Categories help you organize products — e.g. "Beverages", "Snacks", "Toiletries".
                                You can add more anytime.
                            </p>
                        </div>

                        {categoriesCreated.length > 0 && (
                            <ul className="flex flex-wrap gap-2">
                                {categoriesCreated.map((c) => (
                                    <li key={c} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{c}</li>
                                ))}
                            </ul>
                        )}

                        <form onSubmit={handleAddCategory} className="flex gap-2">
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="e.g. Beverages"
                                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={savingCategory}
                                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                            >
                                {savingCategory ? "Adding…" : "Add"}
                            </button>
                        </form>

                        {categoryError && <p className="text-sm text-red-600">{categoryError}</p>}

                        <div className="flex justify-between pt-2">
                            <button onClick={skip} className="text-sm text-slate-500 hover:text-slate-700">
                                Skip for now
                            </button>
                            <button
                                onClick={goNext}
                                className="px-5 py-2 bg-slate-900 text-white rounded-lg font-medium"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === "supplier" && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Add a supplier</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Suppliers let you record purchases and restock quickly. Add your main supplier now,
                                or skip and do it later.
                            </p>
                        </div>

                        {suppliersCreated.length > 0 && (
                            <ul className="flex flex-wrap gap-2">
                                {suppliersCreated.map((s) => (
                                    <li key={s} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">{s}</li>
                                ))}
                            </ul>
                        )}

                        <form onSubmit={handleAddSupplier} className="space-y-3">
                            <input
                                type="text"
                                value={supplierName}
                                onChange={(e) => setSupplierName(e.target.value)}
                                placeholder="Supplier name"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={supplierPhone}
                                    onChange={(e) => setSupplierPhone(e.target.value)}
                                    placeholder="Phone"
                                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="email"
                                    value={supplierEmail}
                                    onChange={(e) => setSupplierEmail(e.target.value)}
                                    placeholder="Email"
                                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={savingSupplier}
                                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                            >
                                {savingSupplier ? "Adding…" : "Add Supplier"}
                            </button>
                        </form>

                        {supplierError && <p className="text-sm text-red-600">{supplierError}</p>}

                        <div className="flex justify-between pt-2">
                            <button onClick={skip} className="text-sm text-slate-500 hover:text-slate-700">
                                Skip for now
                            </button>
                            <button
                                onClick={goNext}
                                className="px-5 py-2 bg-slate-900 text-white rounded-lg font-medium"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === "done" && (
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">You're all set 🚀</h2>
                        <p className="text-slate-500">
                            You can add products, record purchases, and start selling right away.
                            Need M-Pesa payments? Set that up anytime from Settings.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OnboardingWizard;
