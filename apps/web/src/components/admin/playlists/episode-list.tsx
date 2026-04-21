import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  GripVertical, Pencil, Trash2, Plus,
  CheckCircle, ArrowLeft, Video, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlaylist } from "@/hooks/playlist/use-playlist";
import {
  useRemoveEpisode,
  useReorderEpisodes,
} from "@/hooks/playlist/use-playlist-episodes";
import type { PlaylistEpisode } from "@/lib/types/playlist";

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function EpisodeList({ playlistId }: { playlistId: string }) {
  const navigate = useNavigate();

  const { data: playlist, isLoading, isError } = usePlaylist(playlistId);
  const removeMutation  = useRemoveEpisode(playlistId);
  const reorderMutation = useReorderEpisodes(playlistId);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [localEpisodes, setLocalEpisodes] = useState<PlaylistEpisode[] | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const episodes = localEpisodes ?? (playlist?.episodes ?? []);

  // --- Drag handlers ---
  const handleDragStart = (id: string) => setDraggingId(id);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;

    const items = [...episodes];
    const fromIdx = items.findIndex((ep) => ep.id === draggingId);
    const toIdx   = items.findIndex((ep) => ep.id === targetId);
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    setLocalEpisodes(items.map((ep, i) => ({ ...ep, episodeOrder: i + 1 })));
    setHasChanges(true);
  };

  const handleDragEnd = () => setDraggingId(null);

  // --- Save order ---
  const handleSaveOrder = () => {
    reorderMutation.mutate(
      { playlistId, episodeIds: episodes.map((ep) => ep.id) },
      {
        onSuccess: () => {
          setLocalEpisodes(null);
          setHasChanges(false);
        },
      }
    );
  };

  // --- Remove ---
  const handleRemove = (episodeId: string) => {
    removeMutation.mutate({ id: episodeId });
  };

  if (isLoading) return (
    <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
      Loading episodes...
    </div>
  );

  if (isError || !playlist) return (
    <div className="rounded-xl border bg-card p-12 text-center text-sm text-destructive">
      Failed to load episodes
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Episodes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {playlist.title} — drag to reorder
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline" className="gap-2"
            onClick={() => navigate({ to: "/admin/playlists/$id", params: { id: playlistId } })}
          >
            <ArrowLeft size={16} />
            Back to Playlist
          </Button>
          {hasChanges && (
            <Button
              type="button"
              className="gap-2"
              disabled={reorderMutation.isPending}
              onClick={handleSaveOrder}
            >
              <CheckCircle size={16} />
              {reorderMutation.isPending ? "Saving..." : "Save Order"}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <div className="grid grid-cols-[32px_40px_1fr_80px_100px_auto] gap-4 px-6 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span></span>
          <span>#</span>
          <span>Title</span>
          <span>Duration</span>
          <span>Type</span>
          <span></span>
        </div>

        {episodes.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No episodes yet — add content to this playlist
          </div>
        ) : (
          episodes
            .slice()
            .sort((a, b) => a.episodeOrder - b.episodeOrder)
            .map((ep) => (
              <div
                key={ep.id}
                draggable
                onDragStart={() => handleDragStart(ep.id)}
                onDragOver={(e) => handleDragOver(e, ep.id)}
                onDragEnd={handleDragEnd}
                className={`grid grid-cols-[32px_40px_1fr_80px_100px_auto] gap-4 items-center px-6 py-4 border-b last:border-0 transition-colors
                  ${draggingId === ep.id ? "opacity-40 bg-muted" : "hover:bg-muted/30"}`}
              >
                <GripVertical size={16} className="text-muted-foreground cursor-grab" />

                <span className="text-sm text-muted-foreground font-mono">
                  {ep.episodeOrder}
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Video size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {ep.title ?? ep.content.title}
                    </p>
                    {ep.seasonNumber && (
                      <p className="text-xs text-muted-foreground">
                        S{ep.seasonNumber} E{ep.episodeNumber}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-sm text-muted-foreground">
                  {formatDuration(ep.content.duration)}
                </span>

                <Badge variant="outline" className="capitalize text-xs w-fit">
                  {ep.content.contentType.toLowerCase()}
                </Badge>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost" size="icon"
                    onClick={() => navigate({ to: "/admin/content/$id", params: { id: ep.content.id } })}
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost" size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={removeMutation.isPending}
                    onClick={() => handleRemove(ep.id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            ))
        )}

        {/* Footer — Add episode */}
        <div className="px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
          </span>
          <Button
            type="button"
            variant="outline" size="sm" className="gap-2"
            onClick={() => navigate({ to: "/admin/content" })}
          >
            <Plus size={14} />
            Add from Content
          </Button>
        </div>
      </div>
    </div>
  );
}