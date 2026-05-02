import { useNotifications } from "@/hooks/audit/use-notifications"

const ACTION_LABEL: Record<string, string> = {
  CREATE:             "created",
  UPDATE:             "updated",
  DELETE:             "deleted",
  SET_PUBLISH_STATE:  "changed publish state of",
  SET_AVAILABILITY:   "set availability of",
  SET_CLASSIFICATION: "classified",
  ADD_EPISODE:        "added episode to",
  REMOVE_EPISODE:     "removed episode from",
  REORDER_EPISODES:   "reordered episodes in",
  UPDATE_EPISODE:     "updated episode in",
};

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationList({
  isLoading,
  logs,
}: {
  isLoading: boolean;
  logs: ReturnType<typeof useNotifications>["logs"];
}) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }
 
  if (logs.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No recent activity
      </div>
    );
  }
 
  return (
    <>
      {logs.map((log, index) => (
        <div
          key={log.id}
          className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors
            ${index === 0 ? "bg-primary/5" : ""}`}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
            {log.admin.name.charAt(0).toUpperCase()}
          </div>
 
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug">
              <span className="font-medium">{log.admin.name}</span>
              {" "}{ACTION_LABEL[log.action] ?? log.action}{" "}
              <span className="text-muted-foreground capitalize">
                {log.entityType.replace("_", " ").toLowerCase()}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeAgo(log.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}