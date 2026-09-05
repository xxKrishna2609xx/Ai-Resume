import { useEffect, useState, useCallback } from "react";
import { Server, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export function BackendStatusBadge() {
  const [status, setStatus] = useState<"checking" | "live" | "offline">("checking");
  const [lastChecked, setLastChecked] = useState<string>("");

  const checkHealth = useCallback(async () => {
    try {
      setStatus("checking");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setStatus("live");
      } else {
        setStatus("offline");
      }
    } catch {
      setStatus("offline");
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Periodically re-check health every 20 seconds
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={checkHealth}
          className={`group flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono border transition-all duration-300 ${
            status === "live"
              ? "bg-accent/10 border-accent/40 text-accent hover:border-accent/70"
              : status === "offline"
              ? "bg-destructive/10 border-destructive/40 text-destructive hover:border-destructive/70"
              : "bg-muted border-border text-muted-foreground"
          }`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {/* Status Indicator Dot */}
          <span className="relative flex h-2 w-2">
            {status === "live" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            )}
            {status === "offline" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                status === "live"
                  ? "bg-accent"
                  : status === "offline"
                  ? "bg-destructive"
                  : "bg-amber-400"
              }`}
            />
          </span>

          <Server className="w-3.5 h-3.5 flex-shrink-0" />

          <span className="font-semibold tracking-wider text-[11px] uppercase">
            {status === "live" ? "API LIVE" : status === "offline" ? "API OFFLINE" : "CHECKING..."}
          </span>

          <RefreshCw
            className={`w-3 h-3 text-muted-foreground group-hover:rotate-180 transition-transform duration-500 ${
              status === "checking" ? "animate-spin" : ""
            }`}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="bg-card text-foreground border-border text-xs">
        <div className="space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            Backend Endpoint: <code className="text-primary">{API_BASE_URL}</code>
          </p>
          <p className="text-muted-foreground text-[11px]">
            Status: {status === "live" ? "Online & Ready" : status === "offline" ? "Cannot connect to server" : "Pinging endpoint..."}
          </p>
          {lastChecked && (
            <p className="text-[10px] text-muted-foreground/70">Last checked: {lastChecked}</p>
          )}
          <p className="text-[10px] text-primary/80 pt-1">Click to re-check connection</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
