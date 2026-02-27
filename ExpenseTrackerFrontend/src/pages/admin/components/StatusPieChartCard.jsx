import { Box, Card, CardContent, Typography } from "@mui/material";
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const StatusPieChartCard = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="subtitle1">By Status</Typography>
      <Box height={260}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

export default StatusPieChartCard;
