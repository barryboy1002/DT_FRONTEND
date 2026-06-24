function DashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">
                Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-gray-500">
                        Products
                    </h3>

                    <p className="text-3xl font-bold mt-2">
                        --
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-gray-500">
                        Low Stock
                    </h3>

                    <p className="text-3xl font-bold mt-2">
                        --
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-gray-500">
                        Out Of Stock
                    </h3>

                    <p className="text-3xl font-bold mt-2">
                        --
                    </p>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;