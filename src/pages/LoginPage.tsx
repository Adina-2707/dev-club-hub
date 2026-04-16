import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      toast({ title: t("login.welcome") });
      navigate("/profile");
    } else {
      toast({ title: t("login.invalid"), description: t("login.invalidDesc"), variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] px-4 fade-in">
      <Card className="w-full max-w-md rounded-2xl shadow-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">{t("login.title")}</CardTitle>
          <CardDescription>{t("login.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@test.com" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required className="h-11" />
            </div>
            <Button type="submit" className="w-full h-11 gradient-btn text-primary-foreground border-0">{t("login.submit")}</Button>
          </form>
          <div className="mt-6 rounded-xl bg-muted/50 p-4 border">
            <p className="text-xs font-semibold text-muted-foreground mb-2.5">{t("login.demo")}</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p><span className="badge-student px-1.5 py-0.5 rounded-full text-[10px] font-semibold">Student</span> student@test.com / 123456</p>
              <p><span className="badge-mentor px-1.5 py-0.5 rounded-full text-[10px] font-semibold">Mentor</span> mentor@test.com / 123456</p>
              <p><span className="badge-alumni px-1.5 py-0.5 rounded-full text-[10px] font-semibold">Alumni</span> alumni@test.com / 123456</p>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t("login.noAccount")}{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">{t("nav.register")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
