import { useEffect, useState } from "react";
import { Search } from "lucide-react";

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

    async function handleCreateProduct(
        product
    ) {

        try {

            await createProduct(
                product
            );

            await loadData(search);

            setShowProductModal(
                false
            );

        } catch (error) {

            console.error(error);

        }
    }

    async function handleUpdateProduct(
        product
    ) {

        try {

            await updateProduct(
                editingProduct.product_id,
                product
            );

            await loadData(search);

            setEditingProduct(
                null
            );

            setShowProductModal(
                false
            );

        } catch (error) {

            console.error(error);

        }
    }

    async function handleDeleteProduct(
        productId
    ) {

        const confirmed =
            window.confirm(
                "Delete this product?"
            );

        if (!confirmed) return;

        try {

            await deleteProducts([
                productId
            ]);

            await loadData(search);

        } catch (error) {

            console.error(error);

        }
    }

    async function handleCreateCategory(
        name
    ) {

        try {

            await createCategory(
                name
            );

            await loadData(search);

        } catch (error) {

            console.error(error);

        }
    }

    async function handleDeleteCategory(
        categoryId
    ) {

        const confirmed =
            window.confirm(
                "Delete category?"
            );

        if (!confirmed) return;

        try {

            await deleteCategory(
                categoryId
            );

            await loadData(search);

        } catch (error) {

            alert(
                error?.response?.data?.error ||
                "Cannot delete category."
            );
        }
    }

    if (loading) {

        return (
            <div>
                Loading...
            </div>
        );

    }

    return (

        <div className="space-y-6">

            <div
                className="
                flex
                justify-between
                items-center
                "
            >

                <div>

                    <h1
                        className="
                        text-3xl
                        font-bold
                        "
                    >
                        Products
                    </h1>

                    <p
                        className="
                        text-gray-500
                        mt-1
                        "
                    >
                        Manage products and categories
                    </p>

                </div>

                <div
                    className="
                    flex
                    gap-3
                    "
                >

                    <button
                        onClick={() =>
                            setShowCategoryModal(
                                true
                            )
                        }
                        className="
                        border
                        px-4
                        py-2
                        rounded-lg
                        "
                    >
                        Categories
                    </button>

                    <button
                        onClick={() => {

                            setEditingProduct(
                                null
                            );

                            setShowProductModal(
                                true
                            );

                        }}
                        className="
                        bg-green-600
                        text-white
                        px-4
                        py-2
                        rounded-lg
                        hover:bg-green-700
                        "
                    >
                        Add Product
                    </button>

                </div>

            </div>

            {/* Search Section */}
            <div className="flex items-center bg-white rounded-xl shadow px-4 py-3 border border-gray-100">
                <Search className="text-gray-400 mr-3 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search products by name, brand, or barcode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 focus:ring-0 text-sm"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="text-gray-400 hover:text-gray-600 text-sm font-medium ml-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Clear
                    </button>
                )}
            </div>

            <ProductsTable
                products={products}
                onEdit={(product) => {

                    setEditingProduct(
                        product
                    );

                    setShowProductModal(
                        true
                    );

                }}
                onDelete={
                    handleDeleteProduct
                }
            />

            <ProductModal
                isOpen={
                    showProductModal
                }
                product={
                    editingProduct
                }
                categories={
                    categories
                }
                onClose={() => {

                    setShowProductModal(
                        false
                    );

                    setEditingProduct(
                        null
                    );

                }}
                onSubmit={
                    editingProduct
                        ? handleUpdateProduct
                        : handleCreateProduct
                }
            />

            <CategoryModal
                isOpen={
                    showCategoryModal
                }
                categories={
                    categories
                }
                onClose={() =>
                    setShowCategoryModal(
                        false
                    )
                }
                onCreate={
                    handleCreateCategory
                }
                onDelete={
                    handleDeleteCategory
                }
            />

        </div>

    );
}

export default ProductsPage;