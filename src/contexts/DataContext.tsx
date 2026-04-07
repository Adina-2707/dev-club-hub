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

interface DataContextType {
  projects: Project[];
  teams: Team[];
  blogPosts: BlogPost[];
  internships: Internship[];
  comments: Comment[];
  applications: InternshipApplication[];
  addProject: (p: Omit<Project, "id" | "createdAt" | "likes" | "bookmarks">) => void;
  addTeam: (t: Omit<Team, "id" | "createdAt">) => void;
  joinTeam: (teamId: string, member: { id: string; name: string }) => void;
  leaveTeam: (teamId: string, memberId: string) => void;
  updateTeamMemberRole: (teamId: string, memberId: string, role: "leader" | "member") => void;
  addBlogPost: (b: Omit<BlogPost, "id" | "createdAt">) => void;
  addInternship: (i: Omit<Internship, "id" | "createdAt">) => void;
  addInternshipApplication: (a: Omit<InternshipApplication, "id" | "createdAt">) => void;
  updateApplicationStatus: (applicationId: string, status: "pending" | "accepted" | "rejected") => void;
  addComment: (c: Omit<Comment, "id" | "createdAt">) => void;
  toggleLike: (projectId: string, userId: string) => void;
  toggleBookmark: (projectId: string, userId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const sampleProjects: Project[] = [
  { id: "p1", title: "TaskFlow App", description: "A modern task management application with drag-and-drop support.", githubLink: "https://github.com/demo/taskflow", authorId: "1", authorName: "Demo Student", likes: ["3"], bookmarks: [], createdAt: "2024-03-15" },
  { id: "p2", title: "DevChat", description: "Real-time chat application for developer teams.", githubLink: "https://github.com/demo/devchat", authorId: "1", authorName: "Demo Student", likes: ["2", "3"], bookmarks: ["3"], createdAt: "2024-03-10" },
];

const sampleBlogPosts: BlogPost[] = [
  { id: "b1", title: "Getting Started with React", content: "React is a powerful library for building user interfaces. In this post, we'll explore the fundamentals of React including components, state, and props. Whether you're just starting out or looking to refresh your knowledge, this guide will help you understand the core concepts that make React so popular among developers.", authorId: "2", authorName: "Demo Mentor", createdAt: "2024-03-12" },
];

const sampleInternships: Internship[] = [
  { id: "i1", title: "Frontend Developer Intern", description: "Join our team to work on cutting-edge React applications. You'll learn best practices in modern web development.", authorId: "2", authorName: "Demo Mentor", createdAt: "2024-03-14" },
];

const sampleComments: Comment[] = [
  { id: "c1", text: "Отличный проект! Очень впечатляет.", authorId: "3", authorName: "Demo Alumni", targetId: "p1", targetType: "project", createdAt: "2024-03-16" },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [teams, setTeams] = useState<Team[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(sampleBlogPosts);
  const [internships, setInternships] = useState<Internship[]>(sampleInternships);
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);

  const addProject = (p: Omit<Project, "id" | "createdAt" | "likes" | "bookmarks">) =>
    setProjects((prev) => [...prev, { ...p, id: `p${Date.now()}`, likes: [], bookmarks: [], createdAt: new Date().toISOString().split("T")[0] }]);

  const addTeam = (t: Omit<Team, "id" | "createdAt">) =>
    setTeams((prev) => [...prev, { ...t, id: `t${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] }]);

  const leaveTeam = (teamId: string, memberId: string) =>
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, members: t.members.filter((m) => m.id !== memberId) } : t)));

  const updateTeamMemberRole = (teamId: string, memberId: string, role: "leader" | "member") =>
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, members: t.members.map((m) => (m.id === memberId ? { ...m, role } : m)) } : t)));

  const addInternshipApplication = (a: Omit<InternshipApplication, "id" | "createdAt">) =>
    setApplications((prev) => [...prev, { ...a, id: `a${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] }]);

  const updateApplicationStatus = (applicationId: string, status: "pending" | "accepted" | "rejected") =>
    setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status } : app)));

  const addBlogPost = (b: Omit<BlogPost, "id" | "createdAt">) =>
    setBlogPosts((prev) => [...prev, { ...b, id: `b${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] }]);

  const addInternship = (i: Omit<Internship, "id" | "createdAt">) =>
    setInternships((prev) => [...prev, { ...i, id: `i${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] }]);

  const addComment = (c: Omit<Comment, "id" | "createdAt">) =>
    setComments((prev) => [...prev, { ...c, id: `c${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] }]);

  const toggleLike = (projectId: string, userId: string) =>
    setProjects((prev) => prev.map((p) => {
      if (p.id !== projectId) return p;
      const liked = p.likes.includes(userId);
      return { ...p, likes: liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId] };
    }));

  const toggleBookmark = (projectId: string, userId: string) =>
    setProjects((prev) => prev.map((p) => {
      if (p.id !== projectId) return p;
      const bookmarked = p.bookmarks.includes(userId);
      return { ...p, bookmarks: bookmarked ? p.bookmarks.filter((id) => id !== userId) : [...p.bookmarks, userId] };
    }));

  return (
    <DataContext.Provider value={{ projects, teams, blogPosts, internships, comments, applications, addProject, addTeam, joinTeam, leaveTeam, updateTeamMemberRole, addBlogPost, addInternship, addInternshipApplication, updateApplicationStatus, addComment, toggleLike, toggleBookmark }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
