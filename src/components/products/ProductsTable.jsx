function ProductsTable({
    products,
    onEdit,
    onDelete
}) {

    return (
        <div
            className="
            bg-white
            rounded-xl
            shadow
            overflow-hidden
            "
        >

            <table className="w-full">

                <thead
                    className="
                    bg-gray-50
                    text-left
                    "
                >

                    <tr>

                        <th className="p-4">
                            Product
                        </th>

                        <th className="p-4">
                            Category
                        </th>

                        <th className="p-4">
                            Buying
                        </th>

                        <th className="p-4">
                            Selling
                        </th>

                        <th className="p-4">
                            Stock
                        </th>

                        <th className="p-4">
                            Actions
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {
                        products.map(
                            product => (
                                <tr
                                    key={
                                        product.product_id
                                    }
                                    className="
                                    border-t
                                    "
                                >

                                    <td className="p-4">
                                        {
                                            product.name
                                        }
                                    </td>

                                    <td className="p-4">
                                        {
                                            product.category_name ||
                                            "-"
                                        }
                                    </td>

                                    <td className="p-4">
                                        KES {
                                            product.buying_price
                                        }
                                    </td>

                                    <td className="p-4">
                                        KES {
                                            product.selling_price
                                        }
                                    </td>

                                    <td className="p-4">

                                        <span
                                            className={`
                                            px-3
                                            py-1
                                            rounded-full
                                            text-sm
                                            font-medium
                                            ${
                                                Number(
                                                    product.stock_quantity
                                                ) <=
                                                Number(
                                                    product.low_stock_threshhold
                                                )
                                                ? "bg-red-100 text-red-600"
                                                : "bg-green-100 text-green-600"
                                            }
                                            `}
                                        >
                                            {
                                                product.stock_quantity
                                            }
                                        </span>

                                    </td>

                                    <td className="p-4">

                                        <div className="flex gap-2">

                                            <button
                                                onClick={() =>
                                                    onEdit(
                                                        product
                                                    )
                                                }
                                                className="
                                                text-blue-600
                                                "
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    onDelete(
                                                        product.product_id
                                                    )
                                                }
                                                className="
                                                text-red-600
                                                "
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>
                            )
                        )
                    }

                </tbody>

            </table>

        </div>
    );
}

export default ProductsTable;