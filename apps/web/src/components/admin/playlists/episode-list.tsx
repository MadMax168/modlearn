import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  GripVertical, Pencil, Trash2, Plus,
  CheckCircle, ArrowLeft, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Mock data — swap กับ orpc.playlist.getEpisodes ทีหลัง
type Episode = {
  id: string;
  order: number;
  title: string;
  duration: number; // seconds
  published: boolean;
};

const MOCK_EPISODES: Episode[] = [
  { id: "ep-1", order: 1, title: "Introduction to the Course",       duration: 360,  published: true  },
  { id: "ep-2", order: 2, title: "Setting Up Your Environment",      duration: 720,  published: true  },
  { id: "ep-3", order: 3, title: "Core Concepts Explained",          duration: 1080, published: true  },
  { id: "ep-4", order: 4, title: "Building Your First Project",      duration: 1440, published: false },
  { id: "ep-5", order: 5, title: "Advanced Patterns and Techniques", duration: 900,  published: false },
];

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function EpisodeList({ playlistId }: { playlistId: string }) {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<Episode[]>(MOCK_EPISODES);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Add episode form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // --- Drag handlers ---
  const handleDragStart = (id: string) => setDraggingId(id);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;

    setEpisodes((prev) => {
      const items = [...prev];
      const fromIdx = items.findIndex((e) => e.id === draggingId);
      const toIdx   = items.findIndex((e) => e.id === targetId);
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return items.map((ep, i) => ({ ...ep, order: i + 1 }));
    });
    setHasChanges(true);
  };

  const handleDragEnd = () => setDraggingId(null);

  // --- Delete ---
  const handleDelete = (id: string) => {
    setEpisodes((prev) =>
      prev.filter((ep) => ep.id !== id).map((ep, i) => ({ ...ep, order: i + 1 }))
    );
    setHasChanges(true);
  };

  // --- Add episode ---
  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      order: episodes.length + 1,
      title: newTitle.trim(),
      duration: 0,
      published: false,
    };
    setEpisodes((prev) => [...prev, newEp]);
    setNewTitle("");
    setShowAddForm(false);
    setHasChanges(true);
  };

  // --- Save order ---
  const handleSaveOrder = () => {
    // TODO: swap กับ orpc.playlist.updateEpisodeOrder.mutate() ทีหลัง
    console.log("save order", episodes.map((e) => ({ id: e.id, order: e.order })));
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Episodes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drag to reorder — changes are saved manually
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate({ to: "/admin/playlists/$id", params: { id: playlistId } })}
          >
            <ArrowLeft size={16} />
            Back to Playlist
          </Button>
          {hasChanges && (
            <Button className="gap-2" onClick={handleSaveOrder}>
              <CheckCircle size={16} />
              Save Order
            </Button>
          )}
        </div>
      </div>

      {/* Episode List */}
      <div className="rounded-xl border bg-card">

        {/* Table Header */}
        <div className="grid grid-cols-[32px_40px_1fr_80px_100px_auto] gap-4 px-6 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span></span>
          <span>#</span>
          <span>Title</span>
          <span>Duration</span>
          <span>Status</span>
          <span></span>
        </div>

        {/* Rows */}
        {episodes.map((ep) => (
          <div
            key={ep.id}
            draggable
            onDragStart={() => handleDragStart(ep.id)}
            onDragOver={(e) => handleDragOver(e, ep.id)}
            onDragEnd={handleDragEnd}
            className={`grid grid-cols-[32px_40px_1fr_80px_100px_auto] gap-4 items-center px-6 py-4 border-b last:border-0 transition-colors
              ${draggingId === ep.id ? "opacity-40 bg-muted" : "hover:bg-muted/30"}`}
          >
            {/* Drag handle */}
            <GripVertical size={16} className="text-muted-foreground cursor-grab" />

            {/* Order */}
            <span className="text-sm text-muted-foreground font-mono">{ep.order}</span>

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Video size={14} className="text-primary" />
              </div>
              <span className="text-sm font-medium">{ep.title}</span>
            </div>

            {/* Duration */}
            <span className="text-sm text-muted-foreground">
              {ep.duration > 0 ? formatDuration(ep.duration) : "—"}
            </span>

            {/* Status */}
            {ep.published
              ? <Badge className="bg-green-100 text-green-600 hover:bg-green-100">Published</Badge>
              : <Badge variant="secondary">Draft</Badge>
            }

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon"
                onClick={() => navigate({ to: "/admin/content/$id", params: { id: ep.id } })}
              >
                <Pencil size={15} />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(ep.id)}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Episode Form */}
        {showAddForm && (
          <div className="px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Video size={14} className="text-primary" />
              </div>
              <Input
                autoFocus
                placeholder="Episode title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") setShowAddForm(false);
                }}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAdd}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
          </span>
          <Button
            variant="outline" size="sm" className="gap-2"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} />
            Add Episode
          </Button>
        </div>
      </div>

    </div>
  );
}