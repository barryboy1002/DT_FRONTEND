import { useEffect, useState } from "react";

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

    async function loadData() {

        try {

            const [
                productsResponse,
                categoriesResponse
            ] = await Promise.all([
                getProducts(),
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

    useEffect(() => {

        loadData();

    }, []);

    async function handleCreateProduct(
        product
    ) {

        try {

            await createProduct(
                product
            );

            await loadData();

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

            await loadData();

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

            await loadData();

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

            await loadData();

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

            await loadData();

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