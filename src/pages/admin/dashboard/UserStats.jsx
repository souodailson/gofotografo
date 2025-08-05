import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = {
  PRO: '#8884d8',
  PREMIUM: '#82ca9d',
  FREE: '#ffc658',
  TRIAL: '#ff8042',
  EXPIRED: '#ff5b5b',
  'N/A': '#cccccc',
};

const UserStats = ({ stats, loading }) => {
  const planData = Object.entries(stats.planos || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Planos</CardTitle>
        <CardDescription>Visão geral dos planos dos usuários.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={planData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {planData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.toUpperCase()] || COLORS['N/A']} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} usuários`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStats;