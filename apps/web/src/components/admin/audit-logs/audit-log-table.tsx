import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuditLogs } from "@/hooks/audit/use-audit-logs";
import { ChevronDown, ChevronRight } from "lucide-react";

type AuditEntityType = "CONTENT" | "PLAYLIST" | "PLAYLIST_EPISODE" | "CATEGORY" | "FILE";
type AuditAction     = "CREATE" | "UPDATE" | "DELETE" | "SET_PUBLISH_STATE" |
  "SET_AVAILABILITY" | "SET_CLASSIFICATION" | "ADD_EPISODE" |
  "REORDER_EPISODES" | "UPDATE_EPISODE" | "REMOVE_EPISODE";

// Derive the log item type directly from the hook — avoids implicit `any`
type AuditLogItem = NonNullable<
  ReturnType<typeof useAuditLogs>["data"]
>["items"][number];

const ACTION_COLOR: Record<AuditAction, string> = {
  CREATE:              "bg-green-100 text-green-700",
  UPDATE:              "bg-blue-100 text-blue-700",
  DELETE:              "bg-red-100 text-red-700",
  SET_PUBLISH_STATE:   "bg-purple-100 text-purple-700",
  SET_AVAILABILITY:    "bg-orange-100 text-orange-700",
  SET_CLASSIFICATION:  "bg-cyan-100 text-cyan-700",
  ADD_EPISODE:         "bg-teal-100 text-teal-700",
  REORDER_EPISODES:    "bg-yellow-100 text-yellow-700",
  UPDATE_EPISODE:      "bg-indigo-100 text-indigo-700",
  REMOVE_EPISODE:      "bg-rose-100 text-rose-700",
};

const ENTITY_TYPES: AuditEntityType[] = ["CONTENT", "PLAYLIST", "PLAYLIST_EPISODE", "CATEGORY", "FILE"];
const ACTIONS: AuditAction[] = [
  "CREATE", "UPDATE", "DELETE", "SET_PUBLISH_STATE",
  "SET_AVAILABILITY", "SET_CLASSIFICATION", "ADD_EPISODE",
  "REORDER_EPISODES", "UPDATE_EPISODE", "REMOVE_EPISODE",
];

function ExpandIcon({ hasMetadata, isExpanded }: { hasMetadata: boolean; isExpanded: boolean }) {
  if (!hasMetadata) return <span />;
  if (isExpanded)   return <ChevronDown size={14} className="text-muted-foreground" />;
  return <ChevronRight size={14} className="text-muted-foreground" />;
}

function TableBody({
  isLoading,
  isError,
  logs,
  expandedId,
  setExpandedId,
}: {
  isLoading: boolean;
  isError: boolean;
  logs: AuditLogItem[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}) {
  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading logs...</div>;
  }

  if (isError) {
    return <div className="py-16 text-center text-sm text-destructive">Failed to load logs</div>;
  }

  if (logs.length === 0) {
    return <div className="py-16 text-center text-sm text-muted-foreground">No audit logs found</div>;
  }

  return (
    <>
      {logs.map((log) => (
        <div key={log.id}>
          <button
            type="button"
            className="grid w-full grid-cols-[1fr_120px_120px_140px_32px] items-center gap-4 border-b px-6 py-4 text-left transition-colors hover:bg-muted/30 cursor-pointer"
            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpandedId(expandedId === log.id ? null : log.id);
              }
            }}
          >
            {/* Admin */}
            <div>
              <p className="text-sm font-medium">{log.admin.name}</p>
              <p className="text-xs text-muted-foreground">{log.admin.email}</p>
            </div>

            {/* Entity */}
            <Badge variant="outline" className="text-xs w-fit capitalize">
              {log.entityType.replace("_", " ").toLowerCase()}
            </Badge>

            {/* Action */}
            <Badge className={`text-xs w-fit ${ACTION_COLOR[log.action as AuditAction]}`}>
              {log.action.replace(/_/g, " ")}
            </Badge>

            {/* Time */}
            <span className="text-xs text-muted-foreground">
              {new Date(log.createdAt).toLocaleString()}
            </span>

            {/* Expand toggle */}
            <ExpandIcon hasMetadata={!!log.metadata} isExpanded={expandedId === log.id} />
          </button>

          {/* Metadata JSON viewer */}
          {expandedId === log.id && log.metadata && (
            <div className="px-6 py-4 bg-muted/20 border-b">
              <p className="text-xs font-semibold text-muted-foreground mb-2">METADATA</p>
              <pre className="text-xs bg-muted rounded-lg p-4 overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
              {log.ipAddress && (
                <p className="text-xs text-muted-foreground mt-2">
                  IP: {log.ipAddress}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default function AuditLogTable() {
  const [page, setPage]             = useState(1);
  const [entityType, setEntityType] = useState<AuditEntityType | undefined>();
  const [action, setAction]         = useState<AuditAction | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useAuditLogs(page, entityType, action);

  const logs       = data?.items ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  const handleEntityFilter = (val: AuditEntityType | undefined) => {
    setEntityType(val); setPage(1);
  };

  const handleActionFilter = (val: AuditAction | undefined) => {
    setAction(val); setPage(1);
  };

  return (
    <div className="space-y-4">

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Entity Type Filter */}
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <button
            type="button"
            onClick={() => handleEntityFilter(undefined)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
              ${!entityType ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            All Types
          </button>
          {ENTITY_TYPES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => handleEntityFilter(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors
                ${entityType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.replace("_", " ").toLowerCase()}
            </button>
          ))}
        </div>

        {/* Action Filter */}
        <select
          value={action ?? ""}
          onChange={(e) => handleActionFilter((e.target.value as AuditAction) || undefined)}
          className="rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground"
        >
          <option value="">All Actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <div className="grid grid-cols-[1fr_120px_120px_140px_32px] gap-4 px-6 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Admin</span>
          <span>Entity</span>
          <span>Action</span>
          <span>Time</span>
          <span />
        </div>

        <TableBody
          isLoading={isLoading}
          isError={isError}
          logs={logs}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-xs text-muted-foreground">
            {data?.pagination.total ?? 0} log entries
          </span>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
              disabled={page === 1} onClick={() => setPage((p) => p - 1)}>{"<"}</Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button type="button" key={p} variant={p === page ? "default" : "ghost"}
                size="icon" className="h-8 w-8 text-xs"
                onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
              disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>{">"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}