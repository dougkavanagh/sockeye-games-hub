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
		<header className="relative z-10 border-b border-ice-200/15 bg-depth-950/75 backdrop-blur-md">
			<div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
				<button
					type="button"
					onClick={() => onNavigate("home")}
					className="group flex items-center gap-3 text-left"
				>
					<img
						src="/images/mark.png"
						alt=""
						width={64}
						height={64}
						className="h-16 w-16 object-contain transition group-hover:scale-105"
					/>
					<span className="flex items-baseline gap-2">
						<span className="font-display text-2xl tracking-tight text-ice-50 transition group-hover:text-salmon-300 sm:text-[1.7rem]">
							Sockeye
						</span>
						<span className="text-xs font-bold uppercase tracking-[0.18em] text-sea-300">
							Games
						</span>
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
								className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${
									active
										? "bg-sea-400/20 text-ice-50"
										: "text-ice-200/80 hover:bg-kelp-500/20 hover:text-ice-50"
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
