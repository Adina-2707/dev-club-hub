import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, LogOut, User, Moon, Sun, Globe } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.projects"), path: "/projects" },
    { label: t("nav.blog"), path: "/blog" },
    { label: t("nav.internships"), path: "/internships" },
    ...(isAuthenticated && user?.role === "student" ? [{ label: t("nav.teams"), path: "/teams" }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl hero-gradient flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-sm font-bold text-primary-foreground">DC</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Dev Club</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all border border-transparent hover:border-border"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "ru" ? "RU" : "EN"}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5 ml-1">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="h-8 w-8 rounded-full hero-gradient flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-primary-foreground">{user.name[0]}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{user.nickname || user.name}</span>
                  <RoleBadge role={user.role} />
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t("nav.login")}</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gradient-btn text-primary-foreground border-0">{t("nav.register")}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setLang(lang === "ru" ? "en" : "ru")} className="p-2 text-xs font-medium text-muted-foreground">
              {lang === "ru" ? "RU" : "EN"}
            </button>
            <button onClick={toggleTheme} className="p-2 text-muted-foreground">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {t("nav.profile")} <RoleBadge role={user.role} />
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-destructive text-left">
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-muted-foreground">{t("nav.login")}</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-primary">{t("nav.register")}</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t("footer.text")}</p>
        </div>
      </footer>
    </div>
  );
}
