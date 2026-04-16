import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Plus, Pencil, Trash2, BookOpen, Users, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// --- Mock Data ---
type Course = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  stock: number;
  status: "active" | "low" | "sold_out";
};

const MOCK_COURSES: Course[] = [
  { id: "CRS-10024", name: "Web Dev Masterclass",   subtitle: "Frontend & Backend",  price: 199, stock: 42,  status: "active"   },
  { id: "CRS-10082", name: "Python for Data Science",subtitle: "ML & Analytics",      price: 149, stock: 128, status: "active"   },
  { id: "CRS-10095", name: "Advanced UX Design",    subtitle: "Figma & Prototyping", price: 225, stock: 8,   status: "low"      },
  { id: "CRS-10112", name: "SQL for Business",      subtitle: "Postgres & Redis",    price: 89,  stock: 0,   status: "sold_out" },
  { id: "CRS-10130", name: "React Native Bootcamp", subtitle: "iOS & Android",       price: 179, stock: 55,  status: "active"   },
  { id: "CRS-10145", name: "DevOps Fundamentals",   subtitle: "Docker & CI/CD",      price: 159, stock: 23,  status: "active"   },
  { id: "CRS-10158", name: "UI Animation",          subtitle: "Motion & Framer",     price: 119, stock: 4,   status: "low"      },
  { id: "CRS-10172", name: "TypeScript Deep Dive",  subtitle: "Types & Patterns",    price: 139, stock: 0,   status: "sold_out" },
];

const PAGE_SIZE = 4;

// --- Stock Badge ---
function StockBadge({ status, stock }: { status: Course["status"]; stock: number }) {
  if (status === "sold_out") return <Badge variant="destructive">Sold Out</Badge>;
  if (status === "low")      return <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100">{stock} Left</Badge>;
  return <Badge className="bg-green-100 text-green-600 hover:bg-green-100">{stock} Active</Badge>;
}

// --- Main Component ---
export default function ManageCourseTable() {
	const navigate = useNavigate();
	const [search, setSearch]   = useState("");
	const [page, setPage]       = useState(1);

	// Filter by search
	const filtered = useMemo(() =>
		MOCK_COURSES.filter((c) =>
		c.name.toLowerCase().includes(search.toLowerCase()) ||
		c.id.toLowerCase().includes(search.toLowerCase())
		),
		[search]
	);

	// Pagination
	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	// Reset page on search
	const handleSearch = (val: string) => {
		setSearch(val);
		setPage(1);
	};

	return (
		<div className="space-y-4">
			{/* Search + Add */}
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
				<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search..."
					className="pl-9"
					value={search}
					onChange={(e) => handleSearch(e.target.value)}
				/>
				</div>
				<Button
					onClick={() => navigate({ to: "/admin/playlists/new" })}
					className="gap-2"
				>
				<Plus size={16} />
				Add Course
				</Button>
			</div>

			{/* Table */}
			<div className="rounded-xl border bg-card">
				{/* Table Header */}
				<div className="grid grid-cols-[1fr_2.5fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
				<span>ID</span>
				<span>Name</span>
				<span>Price</span>
				<span>Stock</span>
				<span></span>
				</div>

				{/* Rows */}
				{paginated.length === 0 ? (
				<div className="py-16 text-center text-muted-foreground text-sm">
					No courses found
				</div>
				) : (
				paginated.map((course) => (
					<div
						key={course.id}
						onClick={() => navigate({ to: "/admin/playlists/$id", params: { id: course.id } })}
						className="grid grid-cols-[1fr_2.5fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"  // เพิ่ม cursor-pointer
					>
					<span className="text-sm text-muted-foreground">#{course.id}</span>

					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
						<BookOpen size={16} className="text-primary" />
						</div>
						<div>
						<p className="text-sm font-medium">{course.name}</p>
						<p className="text-xs text-muted-foreground">{course.subtitle}</p>
						</div>
					</div>

					<span className="text-sm font-medium">${course.price}.00</span>

					<StockBadge status={course.status} stock={course.stock} />

					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
							<Trash2 size={16} />
						</Button>
					</div>
					</div>
				))
				)}

				{/* Footer */}
				<div className="flex items-center justify-between px-6 py-3">
				<span className="text-xs text-muted-foreground">
					Showing {paginated.length} of {filtered.length} courses
				</span>

				{/* Pagination */}
				<div className="flex items-center gap-1">
					<Button
					variant="ghost" size="icon" className="h-8 w-8"
					disabled={page === 1}
					onClick={() => setPage((p) => p - 1)}
					>
					{"<"}
					</Button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
					<Button
						key={p}
						variant={p === page ? "default" : "ghost"}
						size="icon"
						className="h-8 w-8 text-xs"
						onClick={() => setPage(p)}
					>
						{p}
					</Button>
					))}
					<Button
					variant="ghost" size="icon" className="h-8 w-8"
					disabled={page === totalPages}
					onClick={() => setPage((p) => p + 1)}
					>
					{">"}
					</Button>
				</div>
				</div>
			</div>

			{/* Bottom Stats */}
			<div className="grid grid-cols-3 gap-4">
				{[
				{ icon: Star,      label: "AVG. RATING",      value: "4.9" },
				{ icon: Users,     label: "NEW ENROLLMENTS",  value: "842" },
				{ icon: TrendingUp,label: "MOM REVENUE",      value: "$14,240" },
				].map((stat) => (
				<div key={stat.label} className="rounded-xl border bg-card px-6 py-4 flex items-center gap-4">
					<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
					<stat.icon size={18} className="text-primary" />
					</div>
					<div>
					<p className="text-xl font-bold">{stat.value}</p>
					<p className="text-xs text-muted-foreground">{stat.label}</p>
					</div>
				</div>
				))}
			</div>
		</div>
	);
}