import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin-layout/admin/playlists/$id")({
  component: EditPlaylistPage,
});

function EditPlaylistPage() {
  const { id } = Route.useParams();
  
  return <Outlet />;
}