import { Box, Card, CardContent, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CategoryBarChartCard = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="subtitle1">By Category</Typography>
      <Box height={260}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#0f4c81" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

export default CategoryBarChartCard;
