import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users, Eye, Clock, BookOpen, Film, Upload } from "lucide-react";
import { useAnalyticsOverview } from "@/hooks/analytics/use-analytics";
import { usePlaylists } from "@/hooks/playlist/use-playlists";
import { useContents } from "@/hooks/content/use-content";
import { useAuditLogs } from "@/hooks/audit/use-audit-logs";

export const Route = createFileRoute("/_admin-layout/admin/dashboard")({
  component: AdminDashboardPage,
});

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function AdminDashboardPage() {
  const navigate = useNavigate();

  const { data: overview }    = useAnalyticsOverview();
  const { data: playlists }   = usePlaylists(1, "");
  const { data: contents }    = useContents(1, "", undefined);
  const { data: auditLogs }   = useAuditLogs(1);

  const ACTION_LABEL: Record<string, string> = {
    CREATE:             "created",
    UPDATE:             "updated",
    DELETE:             "deleted",
    SET_PUBLISH_STATE:  "published/unpublished",
    SET_AVAILABILITY:   "set availability",
    SET_CLASSIFICATION: "classified",
    ADD_EPISODE:        "added episode",
    REMOVE_EPISODE:     "removed episode",
    REORDER_EPISODES:   "reordered episodes",
    UPDATE_EPISODE:     "updated episode",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            icon: Users,
            label: "Active Users",
            value: overview?.activeUsers.toLocaleString() ?? "—",
            sub: "Last 15 minutes",
          },
          {
            icon: Eye,
            label: "Total Views",
            value: overview?.totalViews.toLocaleString() ?? "—",
            sub: "All time",
          },
          {
            icon: Clock,
            label: "Watch Duration",
            value: overview ? formatDuration(overview.totalWatchDuration) : "—",
            sub: "All time",
          },
          {
            icon: Film,
            label: "Total Content",
            value: contents?.pagination.total.toLocaleString() ?? "—",
            sub: "All content",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon size={16} className="text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Recent Admin Actions */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Recent Actions</h2>
          </div>
          <div className="divide-y">
            {auditLogs?.items.slice(0, 5).map((log) => (
              <div key={log.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {log.admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.admin.name}</span>
                    {" "}{ACTION_LABEL[log.action] ?? log.action}{" "}
                    <span className="text-muted-foreground capitalize">
                      {log.entityType.replace("_", " ").toLowerCase()}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {!auditLogs?.items.length && (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No recent actions
              </div>
            )}
          </div>
        </div>

        {/* Top Content */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Top Content</h2>
          </div>
          <div className="divide-y">
            {contents?.items.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => navigate({ to: "/admin/content/$id", params: { id: c.id } })}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Film size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.viewCount.toLocaleString()} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate({ to: "/admin/content/new" })}
            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/30 transition-colors text-left"
          >
            <Film size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium">New Content</p>
              <p className="text-xs text-muted-foreground">Add video, audio, or article</p>
            </div>
          </button>
          <button
            onClick={() => navigate({ to: "/admin/playlists/new" })}
            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/30 transition-colors text-left"
          >
            <BookOpen size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium">New Playlist</p>
              <p className="text-xs text-muted-foreground">Create a new course or series</p>
            </div>
          </button>
          <button
            onClick={() => navigate({ to: "/admin/files" })}
            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/30 transition-colors text-left"
          >
            <Upload size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium">Upload File</p>
              <p className="text-xs text-muted-foreground">Upload media files</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}