import { Box, Card, CardContent, Typography } from "@mui/material";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const PALETTE = [
  "#0F4C81",
  "#E07A5F",
  "#2A9D8F",
  "#F4A261",
  "#3D405B",
  "#81B29A",
  "#BC6C25",
  "#6D597A",
  "#D62828",
  "#457B9D"
];

const StatusPieChartCard = ({ data, title = "By Status", height = 340, outerRadius = 115 }) => (
  <Card>
    <CardContent>
      <Typography variant="subtitle1">{title}</Typography>
      <Box height={height}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={outerRadius}>
              {(data || []).map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

export default StatusPieChartCard;
