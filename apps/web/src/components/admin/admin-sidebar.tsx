import { Link, useRouteContext } from "@tanstack/react-router";
import {
	BookOpen,
	ChartBar,
	ChartLine,
	DollarSign,
	LogOut,
	Music,
	Settings,
	Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const navItems = [
	{ label: "Dashboard", icon: ChartLine, to: "/admin/dashboard" },
	{ label: "Users", icon: Users, to: "/admin/users" },
	{ label: "Content", icon: Music, to: "/admin/content" },
	{ label: "Course", icon: BookOpen, to: "/admin/courses" },
	{ label: "Revenue", icon: DollarSign, to: "/admin/revenue" },
	{ label: "Analytics", icon: ChartBar, to: "/admin/analytics" },
	{ label: "Settings", icon: Settings, to: "/admin/settings" },
];

export default function AdminSidebar() {
	const { session } = useRouteContext({ from: "/_admin-layout" });
	const user = session.data?.user;

	return (
		<aside className="flex w-52 flex-col gap-1 space-y-3 border-r bg-card px-3 py-6">
			{/* Logo */}
			<div className="px-3">
				<div className="mb-1 flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground text-sm">
						{user?.name?.charAt(0).toUpperCase() ?? "A"}
					</div>
					<div>
						<p className="font-semibold text-sm leading-none">
							{user?.name ?? "Admin"}
						</p>
						<p className="mt-0.5 text-muted-foreground text-xs">Admin</p>
					</div>
				</div>
			</div>
			<hr />
			{navItems.map((item) => (
				<Link
					activeProps={{
						className:
							"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
					}}
					className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground"
					key={item.to}
					to={item.to}
				>
					<item.icon size={16} />
					{item.label}
				</Link>
			))}

			<div className="mt-auto">
				<button
					className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground"
					onClick={() => authClient.signOut()}
					type="button"
				>
					<LogOut size={16} />
					Sign out
				</button>
			</div>
		</aside>
	);
}
