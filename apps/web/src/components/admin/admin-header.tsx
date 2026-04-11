import { useRouterState } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../mode-toggle";

const pageTitles: Record<string, string> = {
	"/admin/dashboard": "Dashboard",
	"/admin/users": "Users",
	"/admin/content": "Content",
	"/admin/courses/manage": "Course",
	"/admin/courses/new": "Course",
	"/admin/revenue": "Revenue",
	"/admin/analytics": "Analytics",
	"/admin/settings": "Settings",
};

export default function AdminHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const title = pageTitles[pathname] ?? "Dashboard";

	return (
		<header className="flex items-center justify-between border-b bg-background px-6 py-4">
			<h1 className="font-bold text-xl">{title}</h1>

			<div className="space-x-3">
				<ModeToggle />
				<Button className="relative" size="icon" variant="ghost">
					<Bell size={24} />
					<span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500" />
				</Button>
			</div>
		</header>
	);
}
