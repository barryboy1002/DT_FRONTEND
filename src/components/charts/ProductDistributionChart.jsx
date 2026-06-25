import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";

function ProductDistributionChart({ data }) {

    const chartData = data.map(item => ({
        name: item.name,
        value: Number(item.quantity)
    }));

    const COLORS = [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#06B6D4",
    ];

    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                >
                    {chartData.map((entry, index) => (
                        <Cell
                            key={index}
                            fill={
                                COLORS[
                                    index %
                                    COLORS.length
                                ]
                            }
                        />
                    ))}
                </Pie>
                <Legend/>

                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}

export default ProductDistributionChart;