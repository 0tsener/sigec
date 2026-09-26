"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Building2,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useSidebar, type UserProfile } from "@/components/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface TopbarProps {
  user: UserProfile;
}

const sectionTitles: Record<string, string> = {
  "/protected": "Dashboard General",
  "/protected/appointments": "Agenda & Citas",
  "/protected/customers": "Gestión de Clientes",
  "/protected/employees": "Equipo & Empleados",
  "/protected/catalog": "Servicios & Productos",
  "/protected/organizations": "Organizaciones",
  "/protected/settings": "Configuración del Sistema",
  "/protected/profile": "Perfil de Usuario",
};

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  const currentTitle =
    sectionTitles[pathname] ??
    (pathname.startsWith("/protected/")
      ? pathname.replace("/protected/", "").charAt(0).toUpperCase() +
        pathname.replace("/protected/", "").slice(1)
      : "Panel de Control");

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 gap-4">
        {/* Left Side: Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden text-muted-foreground hover:text-foreground -ml-1.5"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
              SIGEC
            </span>
            <span className="text-muted-foreground/60 hidden sm:inline">/</span>
            <h1 className="text-sm font-semibold text-foreground tracking-tight">
              {currentTitle}
            </h1>
          </div>
        </div>

        {/* Center/Context: Multi-tenant Organization Pill */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 border border-border/80 text-xs">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium text-foreground">
              {user.organizationName ?? "Organización Principal"}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] h-4 px-1.5 bg-background font-normal text-muted-foreground border-border"
            >
              Tenant Activo
            </Badge>
          </div>
        </div>

        {/* Right Side: Actions & User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Placeholder */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground h-9 w-9"
            aria-label="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>

          {/* Dark / Light Mode Switcher */}
          <div className="flex items-center">
            <ThemeSwitcher />
          </div>

          <div className="h-5 w-[1px] bg-border mx-0.5" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 h-auto rounded-full hover:bg-muted/70 focus-visible:ring-1"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center shadow-sm">
                  {getInitials(user.fullName)}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-foreground">
                    {user.fullName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.email ?? "sin-email@sigec.local"}
                  </p>
                  <div className="pt-1.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Rol: {user.role}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link
                  href="/protected/settings"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Mi Perfil</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/protected/settings"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
