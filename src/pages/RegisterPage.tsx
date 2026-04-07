import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: "student", label: t("role.student"), description: t("role.student.desc") },
    { value: "mentor", label: t("role.mentor"), description: t("role.mentor.desc") },
    { value: "alumni", label: t("role.alumni"), description: t("role.alumni.desc") },
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (register(name, email, password, role, nickname || undefined, avatar || undefined)) {
      toast({ title: t("register.welcome") });
      navigate("/profile");
    } else {
      toast({ title: t("register.failed"), description: t("register.failedDesc"), variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] px-4 fade-in">
      <Card className="w-full max-w-md rounded-2xl shadow-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">{t("register.title")}</CardTitle>
          <CardDescription>{t("register.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("register.name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">{t("register.nickname")}</Label>
              <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="johndev" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">{t("register.avatar")}</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="h-11" />
              {avatar && <img src={avatar} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required minLength={6} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>{t("register.role")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`rounded-xl border p-3 text-center transition-all duration-200 ${
                      role === r.value ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm" : "hover:bg-muted/80 hover:border-muted-foreground/20"
                    }`}
                  >
                    <div className={`text-sm font-semibold ${role === r.value ? "text-primary" : ""}`}>{r.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{r.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full h-11 gradient-btn text-primary-foreground border-0">{t("register.submit")}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t("register.hasAccount")}{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">{t("nav.login")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
