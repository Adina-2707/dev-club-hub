import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

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
  student?: {
    id: string;
    name: string;
    avatar?: string;
  };
  internship?: {
    id: string;
    title: string;
    description?: string;
  };
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
  navigationRoute?: string; // e.g., "/projects/123", "/blog/456", "/profile"
}

interface DataContextType {
  projects: Project[];
  teams: Team[];
  blogPosts: BlogPost[];
  internships: Internship[];
  comments: Comment[];
  applications: InternshipApplication[];
  notifications: Notification[];
  addProject: (p: Omit<Project, "id" | "createdAt" | "likes" | "bookmarks">) => Promise<void>;
  addTeam: (t: Omit<Team, "id" | "createdAt">) => Promise<void>;
  joinTeam: (teamId: string, member: { id: string; name: string }) => Promise<void>;
  leaveTeam: (teamId: string, memberId: string) => Promise<void>;
  updateTeamMemberRole: (teamId: string, memberId: string, role: "leader" | "member") => Promise<void>;
  addBlogPost: (b: Omit<BlogPost, "id" | "createdAt">) => void;
  updateBlogPost: (id: string, updates: Partial<Pick<BlogPost, "title" | "content">>) => void;
  deleteBlogPost: (id: string) => void;
  addInternship: (i: Omit<Internship, "id" | "createdAt">) => void;
  updateInternship: (id: string, updates: Partial<Pick<Internship, "title" | "description">>) => void;
  deleteInternship: (id: string) => void;
  addInternshipApplication: (a: Omit<InternshipApplication, "id" | "createdAt">) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: "pending" | "accepted" | "rejected") => Promise<void>;
  addComment: (c: Omit<Comment, "id" | "createdAt">) => void;
  deleteComment: (id: string) => void;
  toggleLike: (projectId: string, userId: string) => void;
  toggleBookmark: (projectId: string, userId: string) => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const sampleComments: Comment[] = [
  { id: "c1", text: "Отличный проект! Очень впечатляет.", authorId: "3", authorName: "Demo Alumni", targetId: "p1", targetType: "project", createdAt: "2024-03-16" },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Initialize projects from localStorage or use sample data
  const [projects, setProjects] = useState<Project[]>([]);
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const stored = localStorage.getItem('comments');
      return stored ? JSON.parse(stored) : sampleComments;
    } catch {
      return sampleComments;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const enhanceNotificationRoute = (notification: Notification) => {
    if (notification.navigationRoute) return notification;

    if (notification.type === "application" || notification.type === "application_status") {
      return { ...notification, navigationRoute: "/profile" };
    }

    return notification;
  };

  const [teams, setTeams] = useState<Team[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>(() => {
    try {
      const stored = localStorage.getItem('applications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, teamsRes, blogPostsRes, internshipsRes] = await Promise.all([
          apiService.getProjects(),
          apiService.getTeams(),
          apiService.getBlogPosts(),
          apiService.getInternships(),
        ]);

        setProjects(projectsRes);
        setTeams(teamsRes);
        setBlogPosts(blogPostsRes);
        setInternships(internshipsRes);
      } catch (error) {
        console.error('Failed to load content from server:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setApplications([]);
      setNotifications([]);
      return;
    }

    const loadUserData = async () => {
      try {
        const fetchApplications = user?.role === "mentor" ? apiService.getMentorApplications() : apiService.getMyApplications();
        const [applicationsRes, notificationsRes] = await Promise.all([
          fetchApplications,
          apiService.getNotifications(),
        ]);

        setApplications(applicationsRes as InternshipApplication[]);
        setNotifications((notificationsRes as Notification[]).map(enhanceNotificationRoute));
      } catch (error) {
        console.error('Failed to load user-specific data:', error);
      }
    };

    loadUserData();
  }, [isAuthenticated]);

  // Persist comments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Persist applications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);

  const addProject = async (p: Omit<Project, "id" | "createdAt" | "likes" | "bookmarks">) => {
    try {
      const project = await apiService.createProject(p);
      setProjects((prev) => [
        {
          likes: [],
          bookmarks: [],
          ...project,
        } as Project,
        ...prev,
      ]);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const addTeam = async (t: Omit<Team, "id" | "createdAt">) => {
    try {
      const team = await apiService.createTeam(t);
      setTeams((prev) => [team, ...prev]);
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const joinTeam = async (teamId: string, member: { id: string; name: string }) => {
    try {
      await apiService.joinTeam(teamId, member);
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, members: [...t.members, { ...member, role: "member" }] } : t)));
    } catch (error) {
      console.error('Failed to join team:', error);
    }
  };

  const leaveTeam = async (teamId: string, memberId: string) => {
    try {
      await apiService.leaveTeam(teamId);
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, members: t.members.filter((m) => m.id !== memberId) } : t)));
    } catch (error) {
      console.error('Failed to leave team:', error);
    }
  };

  const updateTeamMemberRole = async (teamId: string, memberId: string, role: "leader" | "member") => {
    try {
      await apiService.updateTeamMemberRole(teamId, memberId, role);
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, members: t.members.map((m) => (m.id === memberId ? { ...m, role } : m)) } : t)));
    } catch (error) {
      console.error('Failed to update team member role:', error);
    }
  };

  const addInternshipApplication = async (a: Omit<InternshipApplication, "id" | "createdAt">) => {
    try {
      const application = await apiService.applyInternship(a);
      setApplications((prev) => [...prev, application as InternshipApplication]);
    } catch (error) {
      console.error('Failed to apply for internship:', error);
      throw error;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: "pending" | "accepted" | "rejected") => {
    try {
      const updatedApplication = await apiService.updateApplicationStatus(applicationId, status);
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...(app as InternshipApplication), ...(updatedApplication as InternshipApplication) } : app)));
    } catch (error) {
      console.error('Failed to update application status:', error);
      throw error;
    }
  };

  const addBlogPost = async (b: Omit<BlogPost, "id" | "createdAt">) => {
    try {
      const post = await apiService.createBlogPost(b);
      setBlogPosts((prev) => [post, ...prev]);
    } catch (error) {
      console.error('Failed to create blog post:', error);
    }
  };

  const addInternship = async (i: Omit<Internship, "id" | "createdAt">) => {
    try {
      const internship = await apiService.createInternship(i);
      setInternships((prev) => [internship, ...prev]);
    } catch (error) {
      console.error('Failed to create internship:', error);
    }
  };

  const updateInternship = (id: string, updates: Partial<Pick<Internship, "title" | "description">>) =>
    setInternships((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));

  const deleteInternship = (id: string) =>
    setInternships((prev) => prev.filter((i) => i.id !== id));

  const updateBlogPost = (id: string, updates: Partial<Pick<BlogPost, "title" | "content">>) =>
    setBlogPosts((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

  const deleteBlogPost = (id: string) =>
    setBlogPosts((prev) => prev.filter((b) => b.id !== id));

  const addComment = (c: Omit<Comment, "id" | "createdAt">) =>
    setComments((prev) => {
      const newComment = { ...c, id: `c${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] };
      // Add notification to project/blog author
      if (c.targetType === "project") {
        const project = projects.find(p => p.id === c.targetId);
        if (project && project.authorId !== c.authorId) {
          addNotification({
            userId: project.authorId,
            type: "comment",
            message: `New comment on your project "${project.title}"`,
            read: false,
            relatedId: c.targetId,
            navigationRoute: `/projects/${c.targetId}`
          });
        }
      } else if (c.targetType === "blog") {
        const blogPost = blogPosts.find(b => b.id === c.targetId);
        if (blogPost && blogPost.authorId !== c.authorId) {
          addNotification({
            userId: blogPost.authorId,
            type: "comment",
            message: `New comment on your blog post "${blogPost.title}"`,
            read: false,
            relatedId: c.targetId,
            navigationRoute: `/posts/${c.targetId}`
          });
        }
      }
      return [...prev, newComment];
    });

  const deleteComment = (id: string) =>
    setComments((prev) => prev.filter((c) => c.id !== id));

  const toggleLike = (projectId: string, userId: string) =>
    setProjects((prev) => prev.map((p) => {
      if (p.id !== projectId) return p;
      const liked = p.likes.includes(userId);
      if (!liked) {
        // Add notification to project author
        addNotification({
          userId: p.authorId,
          type: "like",
          message: `Your project "${p.title}" was liked`,
          read: false,
          relatedId: projectId,
          navigationRoute: `/projects/${projectId}`
        });
      }
      return { ...p, likes: liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId] };
    }));

  const toggleBookmark = (projectId: string, userId: string) =>
    setProjects((prev) => prev.map((p) => {
      if (p.id !== projectId) return p;
      const bookmarked = p.bookmarks.includes(userId);
      return { ...p, bookmarks: bookmarked ? p.bookmarks.filter((id) => id !== userId) : [...p.bookmarks, userId] };
    }));

  const addNotification = (n: Omit<Notification, "id" | "createdAt">) =>
    setNotifications((prev) => [...prev, {
      ...n,
      id: `n${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      navigationRoute: n.navigationRoute || (n.type === "application" || n.type === "application_status" ? "/profile" : undefined),
    }] );

  const markNotificationAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllNotificationsAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

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
