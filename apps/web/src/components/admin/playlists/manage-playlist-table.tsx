import { Plus, Search, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Main Component ---
export default function ManageCourseTable() {
	return (
		<div className="space-y-4">
			{/* Search + Add */}
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search
						className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
						size={16}
					/>
					<Input className="rounded-md pl-9" placeholder="Search..." />
				</div>
				<Button className="gap-2 rounded-md">
					<Plus size={16} />
					Add Course
				</Button>
			</div>

			{/* Table */}
			<div className="rounded-xl border bg-card p-4">Table with pagination</div>

			{/* Bottom Stats */}
			<div className="grid grid-cols-3 gap-4">
				{[
					{ icon: Star, label: "AVG. RATING", value: "4.9" },
					{ icon: Users, label: "NEW ENROLLMENTS", value: "842" },
					{ icon: TrendingUp, label: "MOM REVENUE", value: "$14,240" },
				].map((stat) => (
					<div
						className="flex items-center gap-4 rounded-xl border bg-card px-6 py-4"
						key={stat.label}
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<stat.icon className="text-primary" size={18} />
						</div>
						<div>
							<p className="font-bold text-xl">{stat.value}</p>
							<p className="text-muted-foreground text-xs">{stat.label}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
