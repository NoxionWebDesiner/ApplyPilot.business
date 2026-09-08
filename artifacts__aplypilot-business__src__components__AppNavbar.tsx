import { Luggage, ArrowLeft, LogOut } from "lucide-react";
import { Link } from "wouter";

interface AppNavbarProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  credits: number | null;
  onLogout: () => void;
  maxWidth?: string;
}

export function AppNavbar({
  isLoading,
  isAuthenticated,
  credits,
  onLogout,
  maxWidth = "max-w-4xl",
}: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.07] bg-white/90 backdrop-blur-md">
      <div className={`${maxWidth} mx-auto px-6 h-14 flex items-center justify-between`}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background">
            <Luggage className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-bold text-[16px] tracking-tight text-foreground">
            ApplyPilot <span className="text-blue-600">Business</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {!isLoading && isAuthenticated && (
            <>
              {credits !== null && (
                <Link
                  href="/packs"
                  className="flex items-center gap-1.5 text-sm font-semibold text-foreground bg-black/[0.05] px-2.5 py-1 rounded-full hover:bg-black/[0.09] transition-colors"
                >
                  🪙 {credits} credit{credits !== 1 ? "s" : ""}
                </Link>
              )}
              <button
                onClick={onLogout}
                data-testid="button-logout"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </>
          )}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>
    </header>
  );
}
