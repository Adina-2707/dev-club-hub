import React, { createContext, useContext, useState } from "react";

export interface Project {
  id: string;
  title: string;
  description: string;
  githubLink: string;
  authorId: string;
  authorName: string;
  teamId?: string;
  likes: string[]; // user IDs who liked
  bookmarks: string[]; // user IDs who bookmarked
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  goals?: string;
  category?: string;
  visibility: "public" | "private";
  ownerId: string;
  members: { id: string; name: string; role: "leader" | "member" }[];
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Internship {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface InternshipApplication {
  id: string;
  studentId: string;
  internshipId: string;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  targetId: string;
  targetType: "project" | "blog";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "like" | "comment" | "application_status" | "team_invite";
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string; // project id, application id, etc.
}

interface DataContextType {
  projects: Project[];
  teams: Team[];
  blogPosts: BlogPost[];
  internships: Internship[];
  comments: Comment[];
  applications: InternshipApplication[];
  notifications: Notification[];
  addProject: (p: Omit<Project, "id" | "createdAt" | "likes" | "bookmarks">) => void;
  addTeam: (t: Omit<Team, "id" | "createdAt">) => void;
  joinTeam: (teamId: string, member: { id: string; name: string }) => void;
  leaveTeam: (teamId: string, memberId: string) => void;
  updateTeamMemberRole: (teamId: string, memberId: string, role: "leader" | "member") => void;
  addBlogPost: (b: Omit<BlogPost, "id" | "createdAt">) => void;
  updateBlogPost: (id: string, updates: Partial<Pick<BlogPost, "title" | "content">>) => void;
  deleteBlogPost: (id: string) => void;
  addInternship: (i: Omit<Internship, "id" | "createdAt">) => void;
  updateInternship: (id: string, updates: Partial<Pick<Internship, "title" | "description">>) => void;
  deleteInternship: (id: string) => void;
  addInternshipApplication: (a: Omit<InternshipApplication, "id" | "createdAt">) => void;
  updateApplicationStatus: (applicationId: string, status: "pending" | "accepted" | "rejected") => void;
  addComment: (c: Omit<Comment, "id" | "createdAt">) => void;
  deleteComment: (id: string) => void;
  toggleLike: (projectId: string, userId: string) => void;
  toggleBookmark: (projectId: string, userId: string) => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [projectsData, teamsData, blogPostsData, internshipsData, commentsData] = await Promise.all([
          apiService.getProjects(),
          apiService.getTeams(),
          apiService.getBlogPosts(),
          apiService.getInternships(),
          apiService.getAllComments(),
        ]);

        setProjects(projectsData as Project[]);
        setTeams(teamsData as Team[]);
        setBlogPosts(blogPostsData as BlogPost[]);
        setInternships(internshipsData as Internship[]);
        setComments((commentsData as any[]).map((comment) => ({
          ...comment,
          authorName: comment.authorName || comment.author?.name,
        })));

        try {
          const notificationsData = await apiService.getNotifications();
          setNotifications(notificationsData as Notification[]);
        } catch {
          setNotifications([]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const addProject = async (p: Omit<Project, "id" | "createdAt" | "likes" | "bookmarks">) => {
    const created = await apiService.createProject(p);
    setProjects((prev) => [created as Project, ...prev]);
  };

  const addTeam = async (t: Omit<Team, "id" | "createdAt">) => {
    const created = await apiService.createTeam(t);
    setTeams((prev) => [created as Team, ...prev]);
  };

  const joinTeam = async (teamId: string, member: { id: string; name: string }) => {
    await apiService.joinTeam(teamId, member);
    setTeams((prev) => prev.map((team) => {
      if (team.id !== teamId) return team;
      if (team.members.some((m) => m.id === member.id)) return team;
      return { ...team, members: [...team.members, { id: member.id, name: member.name, role: "member" }] };
    }));
  };

  const leaveTeam = async (teamId: string, memberId: string) => {
    await apiService.leaveTeam(teamId);
    setTeams((prev) => prev.map((team) => {
      if (team.id !== teamId) return team;
      return { ...team, members: team.members.filter((m) => m.id !== memberId) };
    }));
  };

  const updateTeamMemberRole = async (teamId: string, memberId: string, role: "leader" | "member") => {
    await apiService.updateTeam(teamId, { role });
    setTeams((prev) => prev.map((team) => {
      if (team.id !== teamId) return team;
      return {
        ...team,
        members: team.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
      };
    }));
  };

  const addBlogPost = async (b: Omit<BlogPost, "id" | "createdAt">) => {
    const created = await apiService.createBlogPost(b);
    setBlogPosts((prev) => [created as BlogPost, ...prev]);
  };

  const updateBlogPost = async (id: string, updates: Partial<Pick<BlogPost, "title" | "content">>) => {
    const updated = await apiService.updateBlogPost(id, updates);
    setBlogPosts((prev) => prev.map((post) => (post.id === id ? { ...post, ...(updated as Partial<BlogPost>) } : post)));
  };

  const deleteBlogPost = async (id: string) => {
    await apiService.deleteBlogPost(id);
    setBlogPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const addInternship = async (i: Omit<Internship, "id" | "createdAt">) => {
    const created = await apiService.createInternship(i);
    setInternships((prev) => [created as Internship, ...prev]);
  };

  const updateInternship = async (id: string, updates: Partial<Pick<Internship, "title" | "description">>) => {
    const updated = await apiService.updateInternship(id, updates);
    setInternships((prev) => prev.map((internship) => (internship.id === id ? { ...internship, ...(updated as Partial<Internship>) } : internship)));
  };

  const deleteInternship = async (id: string) => {
    await apiService.deleteInternship(id);
    setInternships((prev) => prev.filter((internship) => internship.id !== id));
  };

  const addInternshipApplication = async (a: Omit<InternshipApplication, "id" | "createdAt">) => {
    const created = await apiService.applyInternship({ internshipId: a.internshipId });
    setApplications((prev) => [created as InternshipApplication, ...prev]);
  };

  const updateApplicationStatus = async (applicationId: string, status: "pending" | "accepted" | "rejected") => {
    const updated = await apiService.updateApplicationStatus(applicationId, status);
    setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, ...(updated as Partial<InternshipApplication>) } : app)));
  };

  const addComment = async (c: Omit<Comment, "id" | "createdAt">) => {
    const created = await apiService.createComment(c);
    const comment = {
      ...(created as any),
      authorName: (created as any).authorName || (created as any).author?.name,
    } as Comment;
    setComments((prev) => [comment, ...prev]);
  };

  const deleteComment = async (id: string) => {
    await apiService.deleteComment(id);
    setComments((prev) => prev.filter((comment) => comment.id !== id));
  };

  const toggleLike = async (projectId: string, userId: string) => {
    const likes = await apiService.likeProject(projectId);
    setProjects((prev) => prev.map((project) => project.id === projectId ? { ...project, likes: likes as string[] } : project));
  };

  const toggleBookmark = async (projectId: string, userId: string) => {
    const bookmarks = await apiService.bookmarkProject(projectId);
    setProjects((prev) => prev.map((project) => project.id === projectId ? { ...project, bookmarks: bookmarks as string[] } : project));
  };

  const addNotification = (n: Omit<Notification, "id" | "createdAt">) =>
    setNotifications((prev) => [{ ...n, id: `n${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] }, ...prev]);

  const markNotificationAsRead = async (id: string) => {
    const updated = await apiService.markNotificationAsRead(id);
    setNotifications((prev) => prev.map((notification) => notification.id === id ? { ...notification, ...(updated as Partial<Notification>) } : notification));
  };

  const markAllNotificationsAsRead = async () => {
    await apiService.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  return (
    <DataContext.Provider value={{ projects, teams, blogPosts, internships, comments, applications, notifications, addProject, addTeam, joinTeam, leaveTeam, updateTeamMemberRole, addBlogPost, updateBlogPost, deleteBlogPost, addInternship, updateInternship, deleteInternship, addInternshipApplication, updateApplicationStatus, addComment, deleteComment, toggleLike, toggleBookmark, addNotification, markNotificationAsRead, markAllNotificationsAsRead }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
