import type { PageId } from "@/data/site";

type Props = {
	onNavigate: (page: PageId) => void;
};

export function SiteFooter({ onNavigate }: Props) {
	return (
		<footer className="relative z-10 border-t border-ice-200/10">
			<div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-sm text-ice-200/55 sm:flex-row sm:items-center sm:justify-between">
				<p>Sockeye Games · Free educational games for Canadian students</p>
				<div className="flex gap-4">
					<button
						type="button"
						className="hover:text-ice-50"
						onClick={() => onNavigate("privacy")}
					>
						Privacy
					</button>
					<button
						type="button"
						className="hover:text-ice-50"
						onClick={() => onNavigate("about")}
					>
						About
					</button>
				</div>
			</div>
		</footer>
	);
}
