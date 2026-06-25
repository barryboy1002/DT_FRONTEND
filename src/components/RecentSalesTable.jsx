function RecentSalesTable({
    sales = []
}){
    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
                Recent Sales
            </h2>

            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">
                            Receipt
                        </th>

                        <th className="text-left py-2">
                            Customer
                        </th>

                        <th className="text-left py-2">
                            Payment
                        </th>

                        <th className="text-left py-2">
                            Amount
                        </th>

                        <th className="text-left py-2">
                            Time
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {sales.map((sale) => (
                        <tr
                            key={sale.sale_id}
                            className="border-b"
                        >
                            <td className="py-3">
                                {sale.receipt_number}
                            </td>

                            <td>
                                {sale.customer_name}
                            </td>

                            <td>
                                {sale.payment_method}
                            </td>

                            <td>
                                KES {sale.total_amount}
                            </td>

                            <td>
                                {new Date(
                                    sale.date_time
                                ).toLocaleTimeString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RecentSalesTable;