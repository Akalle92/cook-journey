
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryData } from '@/hooks/useDashboardStats';

interface RecipeCategoriesChartProps {
  categories: CategoryData[];
}

const COLORS = ['#14b8a6', '#f43f5e', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899'];

const RecipeCategoriesChart: React.FC<RecipeCategoriesChartProps> = ({ categories }) => {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-xl font-serif">Recipe Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} recipes`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCategoriesChart;
