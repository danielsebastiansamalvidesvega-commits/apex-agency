"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { ModuleIcon } from "./icons";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Zap } from "lucide-react";

type Props = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function AppSidebar({ variant = "desktop", onNavigate }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setProjectName(data.activeProject?.name ?? null);
        setUserLabel(
          data.profile?.full_name || data.user?.email?.split("@")[0] || null,
        );
      } catch {
        /* ignore */
      }
    }
    void load();
  }, [pathname]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-white/10 bg-[#09090c]",
        variant === "desktop" && "w-[260px] shrink-0",
      )}
    >
      <div className="border-b border-white/10 px-4 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex items-center gap-2.5 pr-10 md:pr-0"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-black shadow-lg shadow-amber-500/20">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <div>
            <div className="text-sm font-bold tracking-tight text-white group-hover:text-amber-200">
              APEX
            </div>
            <div className="text-[11px] text-zinc-500">Agency OS</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 py-3">
        {MODULES.map((m) => {
          const active =
            m.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(m.href);
          return (
            <Link
              key={m.id}
              href={m.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition active:scale-[0.98]",
                active
                  ? "bg-amber-400/15 text-amber-100 ring-1 ring-amber-400/25"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
              )}
            >
              <ModuleIcon
                name={m.icon}
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-amber-300" : "text-zinc-500",
                )}
              />
              <span className="font-medium">{m.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Proyecto activo
          </p>
          <p className="mt-1 truncate text-sm text-zinc-200">
            {projectName ?? "Ninguno seleccionado"}
          </p>
          <Link
            href="/app/proyectos"
            onClick={onNavigate}
            className="mt-2 inline-block text-xs font-medium text-amber-400 hover:text-amber-300"
          >
            Gestionar →
          </Link>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="truncate text-sm text-zinc-300">
            {userLabel ?? "Cuenta"}
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
