import Link from "next/link";
import { ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LandingHero, LandingFeatures, LandingCTA } from "@/components/landing/sections";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const signedIn = Boolean(user);

  return (
    <main className="relative">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-border/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-4 w-4" />
            </span>
            Quarterly Nexus
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#cta" className="hover:text-foreground transition-colors">Get started</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {signedIn ? (
              <Button asChild className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-white">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" /> Open dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost"><Link href="/auth">Sign in</Link></Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-95 text-white">
                  <Link href="/auth?mode=signup">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <LandingHero signedIn={signedIn} />
      <LandingFeatures />
      <LandingCTA signedIn={signedIn} />

      <footer className="border-t border-border/60 py-8 backdrop-blur">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Quarterly Nexus</span>
          <span>Built with Next.js · Supabase · Tailwind · Framer Motion</span>
        </div>
      </footer>
    </main>
  );
}
