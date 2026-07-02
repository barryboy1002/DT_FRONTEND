import { useCallback, useEffect, useState } from "react";
import { Camera } from "lucide-react";
import BarcodeScanner from "../BarcodeScanner";
import { getErrorMessage } from "../../api/axios";

const getSafeErrorMessage = (error) => {
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message || error?.response?.data?.error || "";
    const validationErrors = error?.response?.data?.errors;

    if (status === 409 || /duplicate|already exists|barcode/i.test(backendMessage)) {
        return "This barcode already exists. Please use a different barcode or update the existing product.";
    }

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const firstMessage = validationErrors[0]?.msg || validationErrors[0]?.message;
        if (firstMessage) {
            return firstMessage;
        }
    }

    return getErrorMessage(error);
};

const createInitialFormData = (product) => ({
    name: product?.name || "",
    category_id: product?.category_id || "",
    barcode: product?.barcode || "",
    buying_price: product?.buying_price || "",
    selling_price: product?.selling_price || "",
    brand: product?.brand || "",
    unit: product?.unit || "",
    low_stock_threshhold: product?.low_stock_threshhold ?? 10,
    description: product?.description || ""
});

function ProductModal({
    isOpen,
    onClose,
    onSubmit,
    categories,
    product = null
}) {

    const [formData, setFormData] = useState(() => createInitialFormData(product));
    const [showScanner, setShowScanner] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData(createInitialFormData(product));
    }, [product]);

    const handleChange = useCallback((e) => {
        const {
            name,
            value
        } = e.target;

        setSubmitError("");
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleBarcodeScanned = useCallback((barcode) => {
        setFormData(prev => ({
            ...prev,
            barcode
        }));
        setShowScanner(false);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        setSubmitError("");

        if (!formData.name?.trim()) {
            setSubmitError("Please enter a product name.");
            return;
        }

        if (!formData.category_id) {
            setSubmitError("Please select a category before saving the product.");
            return;
        }

        if (!formData.buying_price || Number(formData.buying_price) <= 0) {
            setSubmitError("Buying price must be greater than zero.");
            return;
        }

        if (!formData.selling_price || Number(formData.selling_price) <= 0) {
            setSubmitError("Selling price must be greater than zero.");
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({
                ...formData,
                buying_price: Number(formData.buying_price),
                selling_price: Number(formData.selling_price),
                low_stock_threshhold: Number(formData.low_stock_threshhold)
            });
        } catch (error) {
            setSubmitError(getSafeErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onSubmit]);

    if (!isOpen) return null;

    return (
        <>
            {showScanner && (
                <BarcodeScanner
                    onScan={handleBarcodeScanned}
                    onClose={() => setShowScanner(false)}
                />
            )}

            <div
                className="
                fixed inset-0
                bg-black/50
                flex items-center
                justify-center
                z-50
                "
            >

            <div
                className="
                bg-white
                rounded-xl
                shadow-xl
                w-full
                max-w-3xl
                max-h-[90vh]
                overflow-y-auto
                "
            >

                <div
                    className="
                    flex
                    justify-between
                    items-center
                    p-6
                    border-b
                    "
                >

                    <h2
                        className="
                        text-xl
                        font-semibold
                        "
                    >
                        {product
                            ? "Edit Product"
                            : "Add Product"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="
                        text-gray-500
                        hover:text-gray-700
                        "
                    >
                        ✕
                    </button>

                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="
                    p-6
                    space-y-5
                    "
                >

                    <div
                        className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                        "
                    >

                        <div>

                            <label
                                className="
                                block
                                mb-2
                                text-sm
                                font-medium
                                "
                            >
                                Product Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={
                                    formData.name
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                className="
                                w-full
                                border
                                rounded-lg
                                px-4
                                py-2
                                "
                            />

                        </div>

                        <div>

                            <label
                                className="
                                block
                                mb-2
                                text-sm
                                font-medium
                                "
                            >
                                Category
                            </label>

                            <select
                                name="category_id"
                                value={
                                    formData.category_id
                                }
                                onChange={
                                    handleChange
                                }
                                className="
                                w-full
                                border
                                rounded-lg
                                px-4
                                py-2
                                "
                            >

                                <option value="">
                                    Select Category
                                </option>

                                {
                                    categories.map(
                                        category => (
                                            <option
                                                key={
                                                    category.category_id
                                                }
                                                value={
                                                    category.category_id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )
                                }

                            </select>

                        </div>

                        <div>

                            <label className="block mb-2 text-sm font-medium">
                                Buying Price
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                name="buying_price"
                                value={formData.buying_price}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-2"
                            />

                        </div>

                        <div>

                            <label className="block mb-2 text-sm font-medium">
                                Selling Price
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                name="selling_price"
                                value={formData.selling_price}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-2"
                            />

                        </div>

                        <div>

                            <label className="block mb-2 text-sm font-medium">
                                Brand
                            </label>

                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2"
                            />

                        </div>

                        <div>

                            <label className="block mb-2 text-sm font-medium">
                                Unit
                            </label>

                            <input
                                type="text"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2"
                            />

                        </div>

                        <div>

                            <label className="block mb-2 text-sm font-medium">
                                Barcode
                            </label>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    placeholder="Enter barcode or scan"
                                    className="flex-1 border rounded-lg px-4 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                                    title="Scan barcode with camera"
                                >
                                    <Camera size={18} />
                                    Scan
                                </button>
                            </div>

                            <p className="mt-2 text-xs text-gray-500">
                                You can scan a barcode with your camera or type it manually.
                            </p>

                        </div>

                        <div>

                            <label className="block mb-2 text-sm font-medium">
                                Low Stock Threshold
                            </label>

                            <input
                                type="number"
                                name="low_stock_threshhold"
                                value={formData.low_stock_threshhold}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2"
                            />

                        </div>

                    </div>

                    <div>

                        <label className="block mb-2 text-sm font-medium">
                            Description
                        </label>

                        <textarea
                            rows="4"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="
                            w-full
                            border
                            rounded-lg
                            px-4
                            py-2
                            "
                        />

                    </div>

                    {submitError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {submitError}
                        </div>
                    )}

                    <div
                        className="
                        flex
                        justify-end
                        gap-3
                        pt-4
                        "
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                            px-4
                            py-2
                            border
                            rounded-lg
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                            px-5
                            py-2
                            bg-green-600
                            text-white
                            rounded-lg
                            hover:bg-green-700
                            disabled:cursor-not-allowed disabled:opacity-70
                            "
                        >
                            {isSubmitting ? "Saving..." : (product ? "Update Product" : "Create Product")}
                        </button>

                    </div>

                </form>

            </div>

            </div>
        </>
    );
}

export default ProductModal;