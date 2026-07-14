import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useHashPage } from "@/lib/routing";
import { AboutPage } from "@/pages/AboutPage";
import { AccountPage } from "@/pages/AccountPage";
import { GamesPage } from "@/pages/GamesPage";
import { HomePage } from "@/pages/HomePage";
import { PrivacyPage } from "@/pages/PrivacyPage";

export function App() {
	const [page, setPage] = useHashPage();

	return (
		<div className="flex min-h-screen flex-col bg-depth-950 text-ice-50">
			<SiteHeader page={page} onNavigate={setPage} />
			<main className="relative flex-1">
				{page === "home" && <HomePage onNavigate={setPage} />}
				{page === "games" && <GamesPage />}
				{page === "about" && <AboutPage />}
				{page === "privacy" && <PrivacyPage />}
				{page === "account" && <AccountPage />}
			</main>
			<SiteFooter onNavigate={setPage} />
		</div>
	);
}
