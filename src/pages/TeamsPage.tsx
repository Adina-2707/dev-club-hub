import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { AccessDenied } from "@/components/AccessDenied";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Eye, EyeOff } from "lucide-react";

export default function TeamsPage() {
  const { user, isAuthenticated } = useAuth();
  const { teams, addTeam, joinTeam, leaveTeam, updateTeamMemberRole } = useData();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [open, setOpen] = useState(false);

  if (!isAuthenticated || user?.role !== "student") {
    return (
      <div className="container mx-auto px-4 py-10">
        <AccessDenied message={t("teams.denied")} />
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    addTeam({
      name,
      description: description || undefined,
      goals: goals || undefined,
      category: category || undefined,
      visibility,
      ownerId: user.id,
      members: [{ id: user.id, name: user.nickname || user.name, role: "leader" }]
    });
    setName(""); setDescription(""); setGoals(""); setCategory(""); setVisibility("public"); setOpen(false);
  };

  const handleJoin = (teamId: string) => {
    if (!user) return;
    joinTeam(teamId, { id: user.id, name: user.nickname || user.name });
  };

  const handleLeave = (teamId: string) => {
    if (!user) return;
    leaveTeam(teamId, user.id);
  };

  const handleRoleChange = (teamId: string, memberId: string, role: "leader" | "member") => {
    updateTeamMemberRole(teamId, memberId, role);
  };

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{t("teams.title")}</h1>
          <p className="text-muted-foreground mt-1.5">{t("teams.subtitle")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-btn text-primary-foreground border-0"><Plus className="h-4 w-4" /> {t("teams.create")}</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{t("teams.create")}</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input placeholder={t("teams.name")} value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
              <Textarea placeholder={t("teams.description")} value={description} onChange={(e) => setDescription(e.target.value)} />
              <Textarea placeholder={t("teams.goals")} value={goals} onChange={(e) => setGoals(e.target.value)} />
              <Input placeholder={t("teams.category")} value={category} onChange={(e) => setCategory(e.target.value)} />
              <Select value={visibility} onValueChange={(value: "public" | "private") => setVisibility(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t("teams.public")}</SelectItem>
                  <SelectItem value="private">{t("teams.private")}</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full gradient-btn text-primary-foreground border-0 h-11">{t("teams.createBtn")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <EmptyState title={t("teams.empty")} description={t("teams.emptyDesc")} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="card-hover rounded-2xl overflow-hidden">
              <div className="h-1.5 hero-gradient" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg hero-gradient flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {team.name}
                      {team.visibility === "private" && <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      {team.visibility === "public" && <Eye className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    {team.category && <p className="text-xs text-muted-foreground mt-1">{team.category}</p>}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {team.description && <p className="text-sm text-muted-foreground mb-2">{team.description}</p>}
                {team.goals && <p className="text-sm text-muted-foreground mb-2"><strong>{t("teams.goals")}:</strong> {team.goals}</p>}
                <p className="text-sm text-muted-foreground mb-3">{team.members.length} {t("teams.members")}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {team.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-1">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        m.role === "leader" ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                      }`}>
                        {m.name} {m.role === "leader" && `(${t("teams.leader")})`}
                      </span>
                      {team.ownerId === user?.id && m.id !== user.id && (
                        <Select value={m.role} onValueChange={(role: "leader" | "member") => handleRoleChange(team.id, m.id, role)}>
                          <SelectTrigger className="h-5 w-5 p-0 border-0 bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">{t("teams.member")}</SelectItem>
                            <SelectItem value="leader">{t("teams.leader")}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
                {team.members.find((m) => m.id === user?.id) ? (
                  team.ownerId !== user?.id && (
                    <Button size="sm" variant="outline" onClick={() => handleLeave(team.id)} className="w-full">{t("teams.leave")}</Button>
                  )
                ) : (
                  team.visibility === "public" && (
                    <Button size="sm" variant="outline" onClick={() => handleJoin(team.id)} className="w-full">{t("teams.join")}</Button>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
