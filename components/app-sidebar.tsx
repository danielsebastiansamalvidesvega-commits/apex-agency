"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { ModuleIcon } from "./icons";
import { useEffect, useState } from "react";
import { getActiveProject } from "@/lib/projects";
import { Zap } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const [projectName, setProjectName] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setProjectName(getActiveProject()?.name ?? null);
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [pathname]);

  const nav = MODULES;

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#09090c]">
      <div className="border-b border-white/10 px-4 py-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-black shadow-lg shadow-amber-500/20">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <div>
            <div className="text-sm font-bold tracking-tight text-white group-hover:text-amber-200">
              APEX
            </div>
            <div className="text-[11px] text-zinc-500">Agency OS · Senior</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {nav.map((m) => {
          const active =
            m.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(m.href);
          return (
            <Link
              key={m.id}
              href={m.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
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
              <span className="font-medium">{m.short}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Proyecto activo
          </p>
          <p className="mt-1 truncate text-sm text-zinc-200">
            {projectName ?? "Ninguno seleccionado"}
          </p>
          <Link
            href="/app/proyectos"
            className="mt-2 inline-block text-xs font-medium text-amber-400 hover:text-amber-300"
          >
            Gestionar →
          </Link>
        </div>
      </div>
    </aside>
  );
}
