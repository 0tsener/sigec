"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  FolderKanban,
  Calendar,
  Plus,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/kpi-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DataOverviewChart } from "@/components/dashboard/data-overview-chart";

interface DashboardMetrics {
  totalClientes: number;
  totalEmpleados: number;
  totalServicios: number;
  recentClientes: Array<{
    id: string;
    nombres: string;
    apellidos: string;
    created_at: string;
  }>;
}

interface DashboardClientProps {
  metrics: DashboardMetrics;
}

export function DashboardClient({ metrics }: DashboardClientProps) {
  const hasData = metrics.totalClientes > 0 || metrics.totalEmpleados > 0 || metrics.totalServicios > 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Clientes Totales"
          value={metrics.totalClientes}
          icon={Users}
          trend="+12%"
          trendUp={true}
          badge="Activo"
          color="blue"
        />
        <KPICard
          title="Personal / Empleados"
          value={metrics.totalEmpleados}
          icon={Briefcase}
          trend="+5%"
          trendUp={true}
          badge="Operativo"
          color="purple"
        />
        <KPICard
          title="Servicios en Catálogo"
          value={metrics.totalServicios}
          icon={FolderKanban}
          trend="+8%"
          trendUp={true}
          badge="Disponible"
          color="green"
        />
        <KPICard
          title="Próximos Eventos"
          value={0}
          icon={Calendar}
          badge="V2 Próximamente"
          color="amber"
          isPlaceholder
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Data Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Resumen de Datos
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Últimos 30 días
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <DataOverviewChart metrics={metrics} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Sin datos suficientes
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Comienza registrando clientes, empleados o servicios para ver gráficos detallados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                Actividad Reciente
              </CardTitle>
              <CardDescription className="text-xs">
                Últimos registros en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity recentClientes={metrics.recentClientes} />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>

      {/* Empty State for No Data */}
      {!hasData && (
        <Card className="shadow-sm border-dashed">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Comienza a usar SIGEC
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Tu organización está lista. Comienza registrando tu primer cliente, empleado o servicio
                  para activar todas las funcionalidades del dashboard.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/protected/clientes">
                  <Button size="sm" className="text-xs font-semibold shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Cliente
                  </Button>
                </Link>
                <Link href="/protected/empleados">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Empleado
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
