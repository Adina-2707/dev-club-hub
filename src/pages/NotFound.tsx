import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center fade-in">
      <div className="text-center">
        <h1 className="mb-4 text-7xl font-extrabold gradient-text">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">{t("notFound.title")}</p>
        <Link to="/">
          <Button variant="outline" size="lg">{t("notFound.back")}</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
