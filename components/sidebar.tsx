"use client";

import React, { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCheck,
  Building2,
  Settings,
  X,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Contact,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface UserProfile {
  id: string;
  email?: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
  organizationName?: string;
  organizationId?: string | null;
}

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider
      value={{ isOpen, setIsOpen, toggleSidebar, closeSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Módulo Principal",
    items: [
      {
        title: "Dashboard",
        href: "/protected/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Agenda & Citas",
        href: "/protected/appointments",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Operaciones",
    items: [
      {
        title: "Personas",
        href: "/protected/personas",
        icon: Contact,
      },
      {
        title: "Clientes",
        href: "/protected/clientes",
        icon: Users,
      },
      {
        title: "Empleados",
        href: "/protected/empleados",
        icon: UserCheck,
      },
      {
        title: "Servicios",
        href: "/protected/servicios",
        icon: Tag,
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        title: "Organizaciones",
        href: "/protected/organizations",
        icon: Building2,
      },
      {
        title: "Configuración",
        href: "/protected/settings",
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  user: UserProfile;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const router = useRouter();

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

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border/70">
          <Link
            href="/protected/dashboard"
            onClick={closeSidebar}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-foreground">
                  SIGEC
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5 font-semibold bg-primary/10 text-primary border-none"
                >
                  V1
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                {user.organizationName ?? "Gestión Empresarial"}
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-muted-foreground/80 tracking-wider uppercase">
                {section.title}
              </p>
              <div className="space-y-1 pt-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSidebar}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span>{item.title}</span>
                      </div>
                      {item.badge ? (
                        <Badge
                          variant={isActive ? "secondary" : "outline"}
                          className="text-[10px] h-4 px-1.5"
                        >
                          {item.badge}
                        </Badge>
                      ) : isActive ? (
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-border/70 bg-muted/20">
        <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary/20">
              {getInitials(user.fullName)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate max-w-[110px]">
                {user.fullName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                {user.role}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Cerrar sesión"
            className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card shrink-0 h-screen sticky top-0 z-20">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent()}
      </aside>
    </>
  );
}
