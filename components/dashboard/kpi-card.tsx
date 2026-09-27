import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  badge?: string;
  color?: "blue" | "purple" | "green" | "amber" | "red";
  isPlaceholder?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/60",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/60",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-900",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-900",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-900",
  },
  red: {
    bg: "bg-rose-50 dark:bg-rose-950/60",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-900",
  },
};

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  badge,
  color = "blue",
  isPlaceholder = false,
}: KPICardProps) {
  const colors = colorClasses[color];

  if (isPlaceholder) {
    return (
      <Card className="shadow-sm border-dashed opacity-70">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {badge}
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </h3>
              <p className="text-2xl font-bold text-foreground">
                {value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </h3>
            <p className="text-2xl font-bold text-foreground">
              {value.toLocaleString()}
            </p>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
