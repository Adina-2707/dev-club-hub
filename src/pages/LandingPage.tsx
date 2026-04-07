import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, Users, GraduationCap, ArrowRight, Rocket, GitBranch, Heart, Github, ExternalLink } from "lucide-react";

export default function LandingPage() {
  const { t } = useLanguage();
  const { projects } = useData();

  const features = [
    { icon: Code2, title: t("landing.feat1.title"), description: t("landing.feat1.desc") },
    { icon: Users, title: t("landing.feat2.title"), description: t("landing.feat2.desc") },
    { icon: GraduationCap, title: t("landing.feat3.title"), description: t("landing.feat3.desc") },
  ];

  const steps = [
    { step: "01", title: t("landing.step1.title"), description: t("landing.step1.desc") },
    { step: "02", title: t("landing.step2.title"), description: t("landing.step2.desc") },
    { step: "03", title: t("landing.step3.title"), description: t("landing.step3.desc") },
  ];

  const topProjects = [...projects].sort((a, b) => b.likes.length - a.likes.length).slice(0, 3);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden py-28 md:py-40">
        <div className="absolute inset-0 hero-gradient opacity-[0.07]" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground mb-8 slide-up">
            <Rocket className="h-4 w-4 text-primary" />
            <span>{t("landing.badge")}</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 slide-up max-w-4xl mx-auto leading-[1.1]">
            {t("landing.title")}{" "}
            <span className="gradient-text">Dev Club</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 slide-up">
            {t("landing.subtitle")}
          </p>
          <div className="flex items-center justify-center gap-4 slide-up">
            <Link to="/register">
              <Button size="lg" className="gradient-btn text-primary-foreground border-0 px-8 gap-2 h-12 text-base">
                {t("landing.getStarted")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">{t("nav.login")}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t("landing.everything")}</h2>
          <p className="text-center text-muted-foreground mb-14 max-w-lg mx-auto">
            {t("landing.everythingDesc")}
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="bg-card rounded-2xl border p-8 card-hover group">
                <div className="h-14 w-14 rounded-2xl hero-gradient flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Projects */}
      {topProjects.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t("landing.topProjects")}</h2>
            <p className="text-center text-muted-foreground mb-14 max-w-lg mx-auto">{t("landing.topProjectsDesc")}</p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {topProjects.map((p) => (
                <Card key={p.id} className="card-hover rounded-2xl overflow-hidden">
                  <div className="h-2 hero-gradient" />
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4 text-destructive" fill="currentColor" /> {p.likes.length}
                      </div>
                      <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                        <Github className="h-3.5 w-3.5" /> GitHub <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">{t("landing.howItWorks")}</h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-3xl mx-auto">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-5xl font-extrabold gradient-text mb-4">{s.step}</div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto bg-card rounded-3xl border p-12 card-hover relative overflow-hidden">
            <div className="absolute inset-0 hero-gradient opacity-5" />
            <div className="relative">
              <GitBranch className="h-12 w-12 text-primary mx-auto mb-5" />
              <h2 className="text-3xl font-bold mb-4">{t("landing.readyToJoin")}</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t("landing.readyDesc")}</p>
              <Link to="/register">
                <Button size="lg" className="gradient-btn text-primary-foreground border-0 px-8 gap-2 h-12">
                  {t("landing.getStarted")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
