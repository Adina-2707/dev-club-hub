import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function AccessDenied({ message }: { message?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 fade-in">
      <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <ShieldX className="h-10 w-10 text-destructive/60" />
      </div>
      <h2 className="text-xl font-bold mb-2">{t("access.denied")}</h2>
      <p className="text-muted-foreground mb-6">{message || t("access.noPermission")}</p>
      <Link to="/">
        <Button variant="outline" className="gap-2">{t("access.goHome")}</Button>
      </Link>
    </div>
  );
}
