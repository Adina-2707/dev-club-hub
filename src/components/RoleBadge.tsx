import { UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function RoleBadge({ role, size = "sm" }: { role: UserRole; size?: "sm" | "md" }) {
  const { t } = useLanguage();
  const sizeClasses = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  const roleLabels = {
    student: t("role.student"),
    mentor: t("role.mentor"),
    alumni: t("role.alumni"),
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full font-semibold badge-${role} ${sizeClasses}`}>
      {roleLabels[role]}
    </span>
  );
}
