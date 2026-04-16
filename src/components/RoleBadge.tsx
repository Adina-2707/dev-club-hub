import { UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function RoleBadge({ role, size = "sm" }: { role: UserRole; size?: "sm" | "md" }) {
  const { t } = useLanguage();
  const roleKey = `role.${role}` as const;
  const sizeClasses = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center rounded-full font-semibold badge-${role} ${sizeClasses}`}>
      {t(roleKey as any)}
    </span>
  );
}
