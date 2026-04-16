import { useNavigate } from "@tanstack/react-router";
import {
	Eye,
	EyeOff,
	FileText,
	Music,
	Plus,
	Search,
	Trash2,
	Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ContentType = "video" | "audio" | "article";

type Content = {
	id: string;
	title: string;
	type: ContentType;
	published: boolean;
	available: boolean;
	views: number;
	price: number | null;
};

const MOCK_CONTENT: Content[] = [
	{
		id: "cnt-001",
		title: "Introduction to React Hooks",
		type: "video",
		published: true,
		available: true,
		views: 4821,
		price: 0,
	},
	{
		id: "cnt-002",
		title: "CSS Grid Deep Dive",
		type: "video",
		published: true,
		available: true,
		views: 2341,
		price: 9.99,
	},
	{
		id: "cnt-003",
		title: "TypeScript Fundamentals Podcast",
		type: "audio",
		published: true,
		available: false,
		views: 891,
		price: 0,
	},
	{
		id: "cnt-004",
		title: "The Future of Web Development",
		type: "article",
		published: false,
		available: false,
		views: 0,
		price: null,
	},
	{
		id: "cnt-005",
		title: "Node.js Performance Tuning",
		type: "video",
		published: true,
		available: true,
		views: 3102,
		price: 14.99,
	},
	{
		id: "cnt-006",
		title: "Database Design Patterns",
		type: "article",
		published: true,
		available: true,
		views: 1500,
		price: 4.99,
	},
	{
		id: "cnt-007",
		title: "DevOps for Developers",
		type: "audio",
		published: false,
		available: false,
		views: 0,
		price: null,
	},
	{
		id: "cnt-008",
		title: "Mastering Git Workflows",
		type: "video",
		published: true,
		available: true,
		views: 2890,
		price: 0,
	},
];

const PAGE_SIZE = 5;

const TYPE_ICON: Record<ContentType, React.ElementType> = {
	video: Video,
	audio: Music,
	article: FileText,
};

const TYPE_COLOR: Record<ContentType, string> = {
	video: "bg-blue-100 text-blue-600",
	audio: "bg-purple-100 text-purple-600",
	article: "bg-orange-100 text-orange-600",
};

export default function ContentTable() {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [filterType, setFilterType] = useState<ContentType | "all">("all");
	const [page, setPage] = useState(1);

	const filtered = useMemo(
		() =>
			MOCK_CONTENT.filter((c) => {
				const matchSearch = c.title
					.toLowerCase()
					.includes(search.toLowerCase());
				const matchType = filterType === "all" || c.type === filterType;
				return matchSearch && matchType;
			}),
		[search, filterType]
	);

	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const handleSearch = (val: string) => {
		setSearch(val);
		setPage(1);
	};
	const handleFilter = (val: ContentType | "all") => {
		setFilterType(val);
		setPage(1);
	};

	return (
		<div className="space-y-4">
			{/* Search + Filter + Add */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1">
					<Search
						className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
						size={16}
					/>
					<Input
						className="pl-9"
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Search content..."
						value={search}
					/>
				</div>

				{/* Type Filter */}
				<div className="flex items-center gap-1 rounded-lg border p-1">
					{(["all", "video", "audio", "article"] as const).map((t) => (
						<button
							className={`rounded-md px-3 py-1 font-medium text-xs capitalize transition-colors ${filterType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
							key={t}
							onClick={() => handleFilter(t)}
						>
							{t}
						</button>
					))}
				</div>

				<Button
					className="gap-2"
					onClick={() => navigate({ to: "/admin/content/new" })}
				>
					<Plus size={16} />
					Add Content
				</Button>
			</div>

			{/* Table */}
			<div className="rounded-xl border bg-card">
				<div className="grid grid-cols-[2.5fr_50px_90px_90px_115px_auto] gap-4 border-b px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
					<span>Title</span>
					<span>Type</span>
					<span>Published</span>
					<span>Available</span>
					<span>Views</span>
					<span />
				</div>

				{paginated.length === 0 ? (
					<div className="py-16 text-center text-muted-foreground text-sm">
						No content found
					</div>
				) : (
					paginated.map((c) => {
						const Icon = TYPE_ICON[c.type];
						return (
							<div
								className="grid cursor-pointer grid-cols-[2.5fr_80px_80px_80px_80px_auto] items-center gap-4 border-b px-6 py-4 transition-colors last:border-0 hover:bg-muted/30"
								key={c.id}
								onClick={() =>
									navigate({ to: "/admin/content/$id", params: { id: c.id } })
								}
							>
								{/* Title */}
								<div className="flex items-center gap-3">
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-lg ${TYPE_COLOR[c.type]}`}
									>
										<Icon size={14} />
									</div>
									<div>
										<p className="font-medium text-sm">{c.title}</p>
										<p className="text-muted-foreground text-xs">
											{c.price === null
												? "No price"
												: c.price === 0
													? "Free"
													: `$${c.price}`}
										</p>
									</div>
								</div>

								{/* Type */}
								<Badge className="w-fit text-xs capitalize" variant="outline">
									{c.type}
								</Badge>

								{/* Published */}
								{c.published ? (
									<Eye className="text-green-500" size={16} />
								) : (
									<EyeOff className="text-muted-foreground" size={16} />
								)}

								{/* Available */}
								{c.available ? (
									<Badge className="w-fit bg-green-100 text-green-600 hover:bg-green-100">
										Yes
									</Badge>
								) : (
									<Badge className="w-fit" variant="secondary">
										No
									</Badge>
								)}

								{/* Views */}
								<span className="text-muted-foreground text-sm">
									{c.views.toLocaleString()}
								</span>

								{/* Actions */}
								<div
									className="flex items-center gap-1"
									onClick={(e) => e.stopPropagation()}
								>
									<Button
										className="text-destructive hover:bg-destructive/10 hover:text-destructive"
										onClick={() => console.log("delete", c.id)}
										size="icon"
										variant="ghost"
									>
										<Trash2 size={15} />
									</Button>
								</div>
							</div>
						);
					})
				)}

				{/* Footer */}
				<div className="flex items-center justify-between px-6 py-3">
					<span className="text-muted-foreground text-xs">
						Showing {paginated.length} of {filtered.length} items
					</span>
					<div className="flex items-center gap-1">
						<Button
							className="h-8 w-8"
							disabled={page === 1}
							onClick={() => setPage((p) => p - 1)}
							size="icon"
							variant="ghost"
						>
							{"<"}
						</Button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<Button
								className="h-8 w-8 text-xs"
								key={p}
								onClick={() => setPage(p)}
								size="icon"
								variant={p === page ? "default" : "ghost"}
							>
								{p}
							</Button>
						))}
						<Button
							className="h-8 w-8"
							disabled={page === totalPages || totalPages === 0}
							onClick={() => setPage((p) => p + 1)}
							size="icon"
							variant="ghost"
						>
							{">"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
