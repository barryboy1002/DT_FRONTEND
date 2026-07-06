import { useEffect, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import ProductsTable from "../components/products/ProductsTable";
import ProductModal from "../components/products/ProductModal";
import CategoryModal from "../components/products/CategoryModal";

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProducts
} from "../api/productsApi";

import {
    getCategories,
    createCategory,
    deleteCategory
} from "../api/categoriesApi";

function ProductsPage() {
    const { user } = useAuth();
    const canModify = user?.role !== "cashier";

    const [products, setProducts] =
        useState([]);

    const [categories, setCategories] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [showProductModal,
        setShowProductModal] =
        useState(false);

    const [showCategoryModal,
        setShowCategoryModal] =
        useState(false);

    const [editingProduct,
        setEditingProduct] =
        useState(null);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    async function loadData(term = search) {

        try {

            const [
                productsResponse,
                categoriesResponse
            ] = await Promise.all([
                getProducts({ search: term }),
                getCategories()
            ]);

            setProducts(
                productsResponse.data || []
            );

            setCategories(
                categoriesResponse.data || []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    }

    async function loadProducts(term) {
        try {
            const productsResponse = await getProducts({ search: term });
            setProducts(productsResponse.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {

        loadData("");

    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        if (!loading) {
            loadProducts(debouncedSearch);
        }
    }, [debouncedSearch]);

    async function handleCreateProduct(product) {
        try {
            await createProduct(product);
            await loadData(debouncedSearch);
            setShowProductModal(false);
        } catch (error) {
            throw error;
        }
    }

    async function handleUpdateProduct(product) {
        try {
            await updateProduct(editingProduct.product_id, product);
            await loadData(debouncedSearch);
            setEditingProduct(null);
            setShowProductModal(false);
        } catch (error) {
            throw error;
        }
    }

    async function handleDeleteProduct(productId) {
        const confirmed = window.confirm("Delete this product?");
        if (!confirmed) return;

        try {
            await deleteProducts([productId]);
            await loadData(debouncedSearch);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleCreateCategory(name) {
        try {
            await createCategory(name);
            await loadData(debouncedSearch);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleDeleteCategory(categoryId) {
        const confirmed = window.confirm("Delete category?");
        if (!confirmed) return;

        try {
            await deleteCategory(categoryId);
            await loadData(debouncedSearch);
        } catch (error) {
            alert(error?.response?.data?.error || "Cannot delete category.");
        }
    }

    if (loading) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">Manage products and categories</p>
                </div>

                {canModify && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCategoryModal(true)}
                            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg border border-gray-300 font-semibold text-sm transition-colors cursor-pointer shadow-sm"
                        >
                            Categories
                        </button>

                        <button
                            onClick={() => {
                                setEditingProduct(null);
                                setShowProductModal(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer shadow-sm"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Add Product</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Search Section */}
            <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm">
                <Search className="text-gray-400 mr-2 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search products by name, brand, or barcode..."
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

            <ProductsTable
                products={products}
                canModify={canModify}
                onEdit={(product) => {
                    setEditingProduct(product);
                    setShowProductModal(true);
                }}
                onDelete={handleDeleteProduct}
            />

            <ProductModal
                isOpen={showProductModal}
                product={editingProduct}
                categories={categories}
                onClose={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                }}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            />

            <CategoryModal
                isOpen={showCategoryModal}
                categories={categories}
                onClose={() => setShowCategoryModal(false)}
                onCreate={handleCreateCategory}
                onDelete={handleDeleteCategory}
            />
        </div>
    );
}

export default ProductsPage;