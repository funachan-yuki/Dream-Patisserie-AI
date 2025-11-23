import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Ingredient } from '../types';

interface CostChartProps {
  ingredients: Ingredient[];
}

// Macaron / Pastel Palette
const COLORS = [
  '#FFB7B2', // Pink
  '#B5EAD7', // Mint
  '#E2F0CB', // Lime
  '#FFDAC1', // Peach
  '#C7CEEA', // Lavender
  '#E0BBE4', // Purple
  '#957DAD', // Darker Purple
  '#FEC8D8'  // Rose
];

const CostChart: React.FC<CostChartProps> = ({ ingredients }) => {
  const data = ingredients.map((item) => ({
    name: item.name,
    value: item.cost,
  })).sort((a, b) => b.value - a.value);

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

  return (
    <div className="h-[300px] w-full font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)} 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontFamily: 'Noto Serif JP' 
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#6D6875' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostChart;