import type { PageId } from "@/data/site";

const NAV: { id: PageId; label: string }[] = [
	{ id: "home", label: "Home" },
	{ id: "games", label: "Games" },
	{ id: "about", label: "About" },
	{ id: "privacy", label: "Privacy" },
	{ id: "account", label: "Account" },
];

type Props = {
	page: PageId;
	onNavigate: (page: PageId) => void;
};

export function SiteHeader({ page, onNavigate }: Props) {
	return (
		<header className="relative z-10 border-b border-ice-200/10">
			<div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
				<button
					type="button"
					onClick={() => onNavigate("home")}
					className="group flex items-baseline gap-2 text-left"
				>
					<span className="font-display text-2xl tracking-tight text-ice-50 transition group-hover:text-salmon-400">
						Sockeye
					</span>
					<span className="text-xs font-medium uppercase tracking-[0.18em] text-ice-200/60">
						Games
					</span>
				</button>
				<nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
					{NAV.map((item) => {
						const active = page === item.id;
						return (
							<button
								key={item.id}
								type="button"
								onClick={() => onNavigate(item.id)}
								className={`rounded-md px-2.5 py-1.5 text-sm transition ${
									active
										? "bg-ice-100/10 text-ice-50"
										: "text-ice-200/70 hover:bg-ice-100/5 hover:text-ice-50"
								}`}
							>
								{item.label}
							</button>
						);
					})}
				</nav>
			</div>
		</header>
	);
}
