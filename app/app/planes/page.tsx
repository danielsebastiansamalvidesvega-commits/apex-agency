"use client";

import { useEffect, useState } from "react";
import { PLAN_ORDER, PLANS, type PlanDef, type PlanId } from "@/lib/plans";
import { Check, Loader2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Status = {
  plan: PlanId;
  planName: string;
  planStatus: string;
  messagesUsedToday: number;
  messagesLimit: number | null;
  stripeConfigured: boolean;
  hasCustomer: boolean;
};

function PlanesContent() {
  const search = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const success = search.get("success") === "1";
  const canceled = search.get("canceled") === "1";

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/status");
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      setStatus(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el plan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function checkout(planId: "pro" | "agency") {
    setError(null);
    setBusyPlan(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar pago");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de checkout");
      setBusyPlan(null);
    }
  }

  async function openPortal() {
    setError(null);
    setBusyPlan("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error del portal");
      setBusyPlan(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando planes…
      </div>
    );
  }

  const current = status?.plan ?? "free";

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <header className="border-b border-white/10 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2 text-amber-300">
          <Crown className="h-4 w-4" />
          <p className="text-xs font-medium uppercase tracking-wider">
            Planes y precios
          </p>
        </div>
        <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
          Elige cómo quieres trabajar con APEX
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Empieza gratis. Mejora cuando necesites más mensajes, anuncios, tech y
          código sin límites diarios.
        </p>
        {status && (
          <p className="mt-3 text-sm text-zinc-300">
            Plan actual:{" "}
            <span className="font-semibold text-amber-300">
              {status.planName}
            </span>
            {status.messagesLimit != null && (
              <span className="text-zinc-500">
                {" "}
                · {status.messagesUsedToday}/{status.messagesLimit} mensajes hoy
              </span>
            )}
            {status.messagesLimit == null && status.plan !== "free" && (
              <span className="text-zinc-500"> · mensajes ilimitados</span>
            )}
          </p>
        )}
      </header>

      <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Pago recibido. Tu plan se actualizará en unos segundos (si no
            cambia, recarga la página).
          </div>
        )}
        {canceled && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            Checkout cancelado. Puedes elegir un plan cuando quieras.
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {!status?.stripeConfigured && (
          <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Los pagos se activan cuando configures Stripe en Vercel. Mientras
            tanto puedes ver los planes y seguir en Gratis.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const isCurrent = current === id;
            return (
              <PlanCard
                key={id}
                plan={plan}
                isCurrent={isCurrent}
                busy={busyPlan === id}
                onSelect={() => {
                  if (id === "free") return;
                  void checkout(id);
                }}
              />
            );
          })}
        </div>

        {status?.hasCustomer && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-medium text-white">Gestionar suscripción</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Cambia tarjeta, cancela o descarga facturas en el portal de Stripe.
            </p>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyPlan === "portal"}
              className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
            >
              {busyPlan === "portal" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Abrir portal de facturación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  busy,
  onSelect,
}: {
  plan: PlanDef;
  isCurrent: boolean;
  busy: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-5",
        plan.popular
          ? "border-amber-400/40 bg-gradient-to-b from-amber-400/10 to-transparent"
          : "border-white/10 bg-white/[0.02]",
        isCurrent && "ring-1 ring-amber-400/50",
      )}
    >
      {plan.popular && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
          <Sparkles className="h-3 w-3" /> Popular
        </span>
      )}
      <div className="flex items-center gap-2">
        {plan.id === "agency" ? (
          <Crown className="h-4 w-4 text-amber-300" />
        ) : plan.id === "pro" ? (
          <Zap className="h-4 w-4 text-amber-300" />
        ) : null}
        <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
      </div>
      <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {plan.priceMonthly === 0 ? (
          "Gratis"
        ) : (
          <>
            ${plan.priceMonthly}
            <span className="text-base font-normal text-zinc-500">/mes</span>
          </>
        )}
      </p>
      <ul className="mt-5 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-zinc-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            {f}
          </li>
        ))}
      </ul>
      {plan.id === "free" ? (
        <div className="mt-6 rounded-xl border border-white/10 py-2.5 text-center text-sm text-zinc-500">
          {isCurrent ? "Tu plan actual" : "Plan base"}
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          disabled={isCurrent || busy}
          className={cn(
            "mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:opacity-50",
            plan.popular
              ? "bg-amber-400 text-black hover:bg-amber-300"
              : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
          )}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isCurrent ? "Plan actual" : `Mejorar a ${plan.name}`}
        </button>
      )}
    </div>
  );
}

function Crown(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={props.className}
    >
      <path d="M2 20h20L19 8l-5 5-2-7-2 7-5-5-3 12z" />
    </svg>
  );
}

export default function PlanesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          Cargando…
        </div>
      }
    >
      <PlanesContent />
    </Suspense>
  );
}
