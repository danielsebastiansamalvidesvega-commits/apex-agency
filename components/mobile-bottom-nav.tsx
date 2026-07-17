"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { ModuleIcon } from "./icons";
import { cn } from "@/lib/utils";
import { LayoutDashboard } from "lucide-react";

const TABS = [
  MODULES.find((m) => m.id === "dashboard")!,
  MODULES.find((m) => m.id === "consejo")!,
  MODULES.find((m) => m.id === "estrategia")!,
  MODULES.find((m) => m.id === "copy")!,
  MODULES.find((m) => m.id === "proyectos")!,
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#09090c]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-1">
        {TABS.map((m) => {
          const active =
            m.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(m.href);
          return (
            <li key={m.id} className="flex-1">
              <Link
                href={m.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition active:scale-95",
                  active ? "text-amber-300" : "text-zinc-500",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition",
                    active ? "bg-amber-400/15" : "bg-transparent",
                  )}
                >
                  {m.id === "dashboard" ? (
                    <LayoutDashboard
                      className={cn(
                        "h-5 w-5",
                        active ? "text-amber-300" : "text-zinc-500",
                      )}
                    />
                  ) : (
                    <ModuleIcon
                      name={m.icon}
                      className={cn(
                        "h-5 w-5",
                        active ? "text-amber-300" : "text-zinc-500",
                      )}
                    />
                  )}
                </span>
                <span className="max-w-[4.5rem] truncate">{m.short}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
