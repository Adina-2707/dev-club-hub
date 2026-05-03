import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Briefcase } from "lucide-react";

export default function InternshipsPage() {
  const { user, isAuthenticated } = useAuth();
  const { internships, addInternship, applications, addInternshipApplication } = useData();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<string>("");
  const [applicationMessage, setApplicationMessage] = useState("");

  const canCreate = isAuthenticated && user?.role === "mentor";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    addInternship({
      title,
      description,
      authorId: user.id,
      authorName: user.nickname || user.name
    });
    setTitle("");
    setDescription("");
    setOpen(false);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedInternship) return;
    addInternshipApplication({
      studentId: user.id,
      internshipId: selectedInternship,
      message: applicationMessage || undefined,
      status: "pending"
    });
    setApplicationMessage("");
    setApplyOpen(false);
  };

  const hasApplied = (internshipId: string) => {
    return applications.some(app => app.studentId === user?.id && app.internshipId === internshipId);
  };

  const getApplicationStatus = (internshipId: string) => {
    return applications.find(app => app.studentId === user?.id && app.internshipId === internshipId)?.status;
  };

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{t("internships.title")}</h1>
          <p className="text-muted-foreground mt-1.5">{t("internships.subtitle")}</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-btn text-primary-foreground border-0"><Plus className="h-4 w-4" /> {t("internships.new")}</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>{t("internships.create")}</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input placeholder={t("internships.titleField")} value={title} onChange={(e) => setTitle(e.target.value)} required className="h-11" />
                <Textarea placeholder={t("projects.description")} value={description} onChange={(e) => setDescription(e.target.value)} required />
                <Button type="submit" className="w-full gradient-btn text-primary-foreground border-0 h-11">{t("internships.createBtn")}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{t("internships.respondTitle")}</DialogTitle></DialogHeader>
          <form onSubmit={handleApply} className="space-y-4">
            <Textarea
              placeholder={t("internships.message")}
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <DialogFooter className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" className="w-full sm:w-auto flex-1 gradient-btn text-primary-foreground border-0 h-11">{t("internships.submitResponse")}</Button>
              <Button type="button" variant="secondary" onClick={() => setApplyOpen(false)} className="w-full sm:w-auto flex-1 h-11">
                {t("profile.cancel")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {internships.length === 0 ? (
        <EmptyState title={t("internships.empty")} description={t("internships.emptyDesc")} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((i) => {
            const appStatus = getApplicationStatus(i.id);
            return (
              <Card key={i.id} className="card-hover rounded-2xl overflow-hidden">
                <div className="h-1.5 hero-gradient" />
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg hero-gradient flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {i.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{t("projects.by")} {i.authorName} · {i.createdAt}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{i.description}</p>
                  {isAuthenticated && user?.role === "student" && (
                    <>
                      {appStatus && (
                        <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full mb-3 ${
                          appStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                          appStatus === "accepted" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {appStatus === "pending" ? t("profile.pending") :
                           appStatus === "accepted" ? t("profile.accepted") :
                           t("profile.rejected")}
                        </span>
                      )}
                      <Button
                        type="button"
                        onClick={() => { setSelectedInternship(i.id); setApplyOpen(true); }}
                        disabled={hasApplied(i.id)}
                        className="w-full gradient-btn text-primary-foreground border-0"
                      >
                        {hasApplied(i.id) ? t("internships.responded") : t("internships.respond")}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
