import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Sidebar,
  SidebarProvider,
  type UserProfile,
} from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Toaster } from "@/components/ui/sonner";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Verificar la sesión del usuario con Supabase
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Si no hay usuario autenticado, redirigir a /sign-in
  if (authError || !user) {
    redirect("/sign-in");
  }

  interface ProfileRecord {
    id?: string;
    full_name?: string;
    name?: string;
    role?: string;
    avatar_url?: string;
    organization_id?: string;
    [key: string]: unknown;
  }

  let profile: ProfileRecord | null = null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!error) {
      profile = data;
    }
  } catch (err) {
    console.error("Error al consultar la tabla profiles:", err);
  }

  // 3. Traer información de la organización (tenant) si está vinculada
  let organizationName = "SIGEC Demo Org";
  const orgId = profile?.organization_id;

  if (orgId) {
    try {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", orgId)
        .maybeSingle();

      if (orgData?.name) {
        organizationName = orgData.name;
      }
    } catch {
      // Usar nombre predeterminado en caso de fallo
    }
  }

  // Estructura normalizada del perfil de usuario
  const userProfile: UserProfile = {
    id: user.id,
    email: user.email,
    fullName:
      profile?.full_name ??
      profile?.name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      (user.email ? user.email.split("@")[0] : "Usuario SIGEC"),
    role:
      profile?.role ??
      user.user_metadata?.role ??
      "Administrador",
    avatarUrl:
      profile?.avatar_url ??
      user.user_metadata?.avatar_url ??
      null,
    organizationName,
    organizationId: orgId ?? null,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex antialiased">
        {/* Barra lateral (Sidebar) */}
        <Sidebar user={userProfile} />

        {/* Área de contenido principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Barra superior (Topbar) */}
          <Topbar user={userProfile} />

          {/* Contenido de la vista protegida */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}