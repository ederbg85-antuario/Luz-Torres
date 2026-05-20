import {
  Instagram,
  Facebook,
  Megaphone,
  LineChart,
  Search,
  Target,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getMarketing } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import {
  MARKETING_PROVIDER_DESC,
  MARKETING_PROVIDER_LABELS,
} from "@/lib/constants";
import type { MarketingProvider } from "@/lib/types";
import { cn, formatNumber, formatRelative } from "@/lib/format";

const PROVIDER_ICON: Record<MarketingProvider, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  meta_ads: Megaphone,
  google_analytics: LineChart,
  search_console: Search,
  google_ads: Target,
};

const PROVIDERS: MarketingProvider[] = [
  "instagram",
  "facebook",
  "meta_ads",
  "google_analytics",
  "search_console",
  "google_ads",
];

function formatMetric(metric: string, value: number) {
  if (metric === "inversion") return `$${formatNumber(value)}`;
  return formatNumber(value);
}

export default async function MarketingPage() {
  const { integrations, metrics } = await getMarketing();

  // Agrupar métricas por proveedor + nombre, ordenadas por fecha desc.
  const byKey: Record<string, { current: number; previous?: number }> = {};
  const seen: Record<string, boolean> = {};
  for (const m of metrics) {
    const key = `${m.provider}|${m.metric}`;
    if (!byKey[key]) {
      byKey[key] = { current: m.value };
      seen[key] = true;
    } else if (byKey[key].previous === undefined) {
      byKey[key].previous = m.value;
    }
  }

  const metricsByProvider: Record<
    string,
    { metric: string; current: number; previous?: number }[]
  > = {};
  for (const key of Object.keys(byKey)) {
    const [provider, metric] = key.split("|");
    (metricsByProvider[provider] ??= []).push({
      metric,
      ...byKey[key],
    });
  }

  return (
    <>
      <PageHeader
        title="Marketing"
        description="Métricas de tus canales digitales en un solo lugar."
      />

      {/* Aviso de estructura */}
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-vivo/8 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-vivo" />
        <div className="text-sm text-petroleo">
          <p className="font-semibold">Panel listo para conectar.</p>
          <p className="mt-0.5 text-petroleo/80">
            La estructura para Instagram, Facebook, Meta Ads, Google Analytics,
            Search Console y Google Ads ya está preparada. La autenticación con
            cada plataforma y la sincronización automática se habilitan en una
            fase posterior. Los datos mostrados son de ejemplo.
          </p>
        </div>
      </div>

      {/* Integraciones */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDERS.map((provider) => {
          const Icon = PROVIDER_ICON[provider];
          const integration = integrations.find(
            (i) => i.provider === provider
          );
          const connected = integration?.status === "conectado";
          return (
            <div
              key={provider}
              className="rounded-xl bg-papel p-5 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-petroleo/8 text-petroleo">
                  <Icon className="h-5 w-5" />
                </span>
                <Badge tone={connected ? "green" : "neutral"}>
                  {connected ? "Conectado" : "Desconectado"}
                </Badge>
              </div>
              <h3 className="mt-3 font-semibold text-carbon">
                {MARKETING_PROVIDER_LABELS[provider]}
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-humo">
                {MARKETING_PROVIDER_DESC[provider]}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-lino pt-3">
                <span className="text-[12px] text-humo">
                  {integration?.last_synced_at
                    ? `Sync ${formatRelative(integration.last_synced_at)}`
                    : "Sin sincronizar"}
                </span>
                <button
                  type="button"
                  disabled
                  className="flex cursor-not-allowed items-center gap-1.5 rounded-full bg-nieve px-3 py-1.5 text-[12px] font-semibold text-humo"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Conectar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Métricas */}
      <h2 className="mb-3 mt-10 text-lg font-semibold text-carbon">
        Métricas (datos de ejemplo)
      </h2>
      <div className="space-y-4">
        {PROVIDERS.filter((p) => metricsByProvider[p]?.length).map(
          (provider) => (
            <div
              key={provider}
              className="rounded-xl bg-papel p-5 shadow-soft"
            >
              <h3 className="text-sm font-semibold text-carbon">
                {MARKETING_PROVIDER_LABELS[provider]}
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {metricsByProvider[provider].map((m) => {
                  const delta =
                    m.previous !== undefined && m.previous !== 0
                      ? ((m.current - m.previous) / m.previous) * 100
                      : null;
                  const up = (delta ?? 0) >= 0;
                  return (
                    <div
                      key={m.metric}
                      className="rounded-md bg-nieve p-3.5"
                    >
                      <p className="text-[12px] capitalize text-humo">
                        {m.metric}
                      </p>
                      <p className="mt-1 font-mono text-xl font-medium text-carbon">
                        {formatMetric(m.metric, m.current)}
                      </p>
                      {delta !== null && (
                        <p
                          className={cn(
                            "mt-0.5 flex items-center gap-1 text-[12px] font-medium",
                            up ? "text-vivo" : "text-rose-600"
                          )}
                        >
                          {up ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {up ? "+" : ""}
                          {delta.toFixed(1)}% · 30 días
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
