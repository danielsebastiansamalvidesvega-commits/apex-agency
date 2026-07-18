"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { ModuleIcon } from "./icons";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { Brand } from "./brand";

type Props = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function AppSidebar({ variant = "desktop", onNavigate }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string>("Gratis");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [profileRes, billRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/billing/status"),
        ]);
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (!cancelled) {
            setProjectName(data.activeProject?.name ?? null);
            setUserLabel(
              data.profile?.full_name ||
                data.user?.email?.split("@")[0] ||
                null,
            );
          }
        }
        if (billRes.ok) {
          const bill = await billRes.json();
          if (!cancelled) setPlanName(bill.planName || "Gratis");
        }
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
        <div className="pr-10 md:pr-0">
          <Brand href="/app" onClick={onNavigate} />
        </div>
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
          <Link
            href="/app/planes"
            onClick={onNavigate}
            className="mt-1.5 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 hover:bg-amber-400/15"
          >
            Plan {planName}
          </Link>
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
