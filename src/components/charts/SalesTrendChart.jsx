import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function SalesTrendChart({ data }) {
  const chartData = data.map(item => ({
    period: new Date(item.period)
        .toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric"
        }),
    revenue: Number(item.revenue)
}));
  return (
    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="period" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SalesTrendChart;