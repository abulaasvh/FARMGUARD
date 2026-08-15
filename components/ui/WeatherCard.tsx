import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

interface WeatherCardProps {
  day: string;
  temp: number | string;
  condition: string;
}

export default function WeatherCard({ day, temp, condition }: WeatherCardProps) {
  const { t } = useI18n();

  const conditionKey = `weather.${condition.toLowerCase()}`;
  const conditionLabel = t(conditionKey) !== conditionKey ? t(conditionKey) : condition;
  return (
    <Card className="flex flex-col items-center p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{day}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <span className="text-2xl font-bold">{temp}°C</span>
        <span className="mt-1 text-sm text-muted-foreground">{conditionLabel}</span>
      </CardContent>
    </Card>
  );
}
