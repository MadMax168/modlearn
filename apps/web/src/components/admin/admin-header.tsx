import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/audit/use-notifications"
import { useEffect, useRef } from "react";
import { ModeToggle } from "../mode-toggle";
import { NotificationList } from "../notification";

const pageTitles: Record<string, string> = {
  "/admin/dashboard":  "Dashboard",
  "/admin/users":      "Users",
  "/admin/content":    "Content",
  "/admin/playlists":  "Playlist",
  "/admin/categories": "Categories",
  "/admin/files":      "Files",
  "/admin/analytics":  "Analytics",
  "/admin/audit-logs": "Audit Logs",
  "/admin/settings":   "Settings",
};

export default function AdminHeader() {
  const pathname  = useRouterState({ select: (s) => s.location.pathname });
  const navigate  = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { logs, isLoading, unreadCount, isOpen, handleOpen, handleClose } =
    useNotifications();

  const getTitle = (path: string) => {
    if (path.endsWith("/episodes")) return "Episodes";
    if (path.endsWith("/pricing"))  return "Pricing";
    if (pageTitles[path])           return pageTitles[path];
    if (path.startsWith("/admin/playlists")) return "Playlist";
    if (path.startsWith("/admin/content"))   return "Content";
    return "Dashboard";
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, handleClose]);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <h1 className="text-xl font-bold">{getTitle(pathname)}</h1>

      {/* Notification Bell */}
      <div className="relative" ref={dropdownRef}>
        <ModeToggle />
        <Button
          variant="ghost" size="icon"
          className="relative"
          onClick={isOpen ? handleClose : handleOpen}
        >
          <Bell size={20} />
          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-80 rounded-xl border bg-card shadow-lg z-50">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Updates every 30s
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClose}>
                  <X size={14} />
                </Button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              <NotificationList isLoading={isLoading} logs={logs} />
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t">
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground"
                onClick={() => {
                  handleClose();
                  navigate({ to: "/admin/audit-logs" });
                }}
              >
                View all activity →
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}