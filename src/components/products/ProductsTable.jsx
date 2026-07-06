function ProductsTable({ products, onEdit, onDelete, canModify = true }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
                    <tr>
                        <th className="p-4 font-semibold">Product</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold">Buying Price</th>
                        <th className="p-4 font-semibold">Selling Price</th>
                        <th className="p-4 font-semibold">Stock</th>
                        {canModify && <th className="p-4 font-semibold">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {products.map(product => {
                        const isLowStock = Number(product.stock_quantity) <= Number(product.low_stock_threshhold);
                        const isOutOfStock = Number(product.stock_quantity) === 0;
                        
                        return (
                            <tr key={product.product_id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="p-4">
                                    <div>
                                        <div className="font-semibold text-gray-900">{product.name}</div>
                                        {product.barcode && (
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">
                                                {product.barcode}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">
                                    {product.category_name || <span className="text-gray-400">Uncategorized</span>}
                                </td>
                                <td className="p-4 text-gray-900 font-medium">
                                    KES {Number(product.buying_price).toLocaleString()}
                                </td>
                                <td className="p-4 text-gray-900 font-medium">
                                    KES {Number(product.selling_price).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        isOutOfStock 
                                            ? "bg-red-50 text-red-700 border border-red-200"
                                            : isLowStock
                                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                                            : "bg-green-50 text-green-700 border border-green-200"
                                    }`}>
                                        {product.stock_quantity} {product.unit || 'units'}
                                    </span>
                                </td>
                                {canModify && (
                                    <td className="p-4">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(product.product_id)}
                                                className="text-red-600 hover:text-red-700 font-semibold text-sm transition-colors cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan="6" className="text-center p-12 text-gray-400 bg-gray-50">
                                No products found. Add your first product to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ProductsTable;