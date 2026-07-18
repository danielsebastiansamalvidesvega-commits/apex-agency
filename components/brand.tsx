import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  showTagline?: boolean;
  tagline?: string;
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
};

/** Logo + nombre de marca: tomatito 🍅 */
export function Brand({
  href = "/app",
  showTagline = true,
  tagline = "Tu agencia digital",
  size = "md",
  className,
  onClick,
}: Props) {
  const iconSize = size === "sm" ? "h-8 w-8 text-lg" : "h-9 w-9 text-xl";
  const nameSize = size === "sm" ? "text-sm" : "text-sm";

  const inner = (
    <span className={cn("group flex min-w-0 items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20",
          iconSize,
        )}
        aria-hidden
      >
        🍅
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block font-bold tracking-tight text-white group-hover:text-red-200",
            nameSize,
          )}
        >
          tomatito
        </span>
        {showTagline && (
          <span className="block truncate text-[11px] text-zinc-500">
            {tagline}
          </span>
        )}
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex min-w-0">
        {inner}
      </Link>
    );
  }

  return inner;
}
