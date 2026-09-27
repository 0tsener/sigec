console.log("=== DETECTOR DE SUPABASE URL ===", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("=== DETECTOR DE CLAVE ANON ===", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "LOGRADO (La clave está presente)" : "ERROR (No se detecta la clave - undefined)");
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
