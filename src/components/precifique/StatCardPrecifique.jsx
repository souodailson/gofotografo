import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatCardPrecifique = ({ title, value, icon: Icon, description, colorClass = "text-customPurple" }) => (
  <Card className="precifique-card-standard flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${colorClass}`} />
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-center">
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
      {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
    </CardContent>
  </Card>
);

export default StatCardPrecifique;