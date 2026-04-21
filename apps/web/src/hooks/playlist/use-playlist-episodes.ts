import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { playlistKeys } from "./use-playlists";

export function useAddEpisode(playlistId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...orpc.playlist.adminAddEpisode.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
    },
  });
}

export function useRemoveEpisode(playlistId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...orpc.playlist.adminRemoveEpisode.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
    },
  });
}

export function useReorderEpisodes(playlistId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...orpc.playlist.adminReorderEpisodes.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: playlistKeys.detail(playlistId) });
      const previous = queryClient.getQueryData(playlistKeys.detail(playlistId));
      queryClient.setQueryData(playlistKeys.detail(playlistId), (old: any) => {
        if (!old?.episodes) return old;
        const reordered = variables.episodeIds.map((epId, index) => {
          const ep = old.episodes.find((e: any) => e.id === epId);
          return { ...ep, episodeOrder: index + 1 };
        });
        return { ...old, episodes: reordered };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(playlistKeys.detail(playlistId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
    },
  });
}