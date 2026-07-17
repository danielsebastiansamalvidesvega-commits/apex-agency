import {
  Code2,
  Cpu,
  FolderKanban,
  LayoutDashboard,
  Megaphone,
  PenLine,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ModuleDef } from "@/lib/modules";

const MAP: Record<ModuleDef["icon"], LucideIcon> = {
  layout: LayoutDashboard,
  users: Users,
  target: Target,
  pen: PenLine,
  megaphone: Megaphone,
  cpu: Cpu,
  code: Code2,
  folder: FolderKanban,
};

export function ModuleIcon({
  name,
  className,
}: {
  name: ModuleDef["icon"];
  className?: string;
}) {
  const Icon = MAP[name];
  return <Icon className={className} />;
}
