import React, { createContext, useContext, useState } from "react";

type Lang = "ru" | "en";

const translations = {
  // Nav
  "nav.home": { ru: "Главная", en: "Home" },
  "nav.projects": { ru: "Проекты", en: "Projects" },
  "nav.blog": { ru: "Блог", en: "Blog" },
  "nav.internships": { ru: "Стажировки", en: "Internships" },
  "nav.teams": { ru: "Команды", en: "Teams" },
  "nav.profile": { ru: "Профиль", en: "Profile" },
  "nav.login": { ru: "Войти", en: "Login" },
  "nav.register": { ru: "Регистрация", en: "Register" },
  "nav.logout": { ru: "Выйти", en: "Logout" },

  // Landing
  "landing.badge": { ru: "Сообщество разработчиков", en: "Student Developer Community" },
  "landing.title": { ru: "Создавай, делись и расти с", en: "Build, Share, and Grow with" },
  "landing.subtitle": { ru: "Платформа для совместной работы, где студенты создают проекты, формируют команды и учатся у менторов.", en: "A collaborative platform where students create projects, form teams, and learn from mentors." },
  "landing.getStarted": { ru: "Начать", en: "Get Started" },
  "landing.everything": { ru: "Всё, что вам нужно", en: "Everything You Need" },
  "landing.everythingDesc": { ru: "Инструменты и возможности для развития студентов-разработчиков.", en: "Tools and features designed for student developers to grow." },
  "landing.feat1.title": { ru: "Создание проектов", en: "Create Projects" },
  "landing.feat1.desc": { ru: "Создавайте и демонстрируйте свои проекты с интеграцией GitHub.", en: "Build and showcase your projects with GitHub integration." },
  "landing.feat2.title": { ru: "Работа в командах", en: "Collaborate in Teams" },
  "landing.feat2.desc": { ru: "Формируйте команды, работайте вместе и создавайте великое.", en: "Form teams, work together, and build something great." },
  "landing.feat3.title": { ru: "Учитесь у менторов", en: "Learn from Mentors" },
  "landing.feat3.desc": { ru: "Получайте советы от опытных менторов и профессионалов.", en: "Get guidance from experienced mentors and industry pros." },
  "landing.howItWorks": { ru: "Как это работает", en: "How It Works" },
  "landing.step1.title": { ru: "Регистрация", en: "Sign Up" },
  "landing.step1.desc": { ru: "Создайте аккаунт и выберите свою роль.", en: "Create your account and choose your role." },
  "landing.step2.title": { ru: "Исследуйте", en: "Explore" },
  "landing.step2.desc": { ru: "Просматривайте проекты, блог и стажировки.", en: "Browse projects, blog posts, and internships." },
  "landing.step3.title": { ru: "Создавайте", en: "Build" },
  "landing.step3.desc": { ru: "Создавайте проекты, присоединяйтесь к командам.", en: "Create projects, join teams, and start collaborating." },
  "landing.readyToJoin": { ru: "Готовы присоединиться?", en: "Ready to Join?" },
  "landing.readyDesc": { ru: "Присоединяйтесь к Dev Club и начните создавать вместе с сообществом разработчиков.", en: "Join Dev Club and start building with a community of passionate developers." },
  "landing.topProjects": { ru: "Популярные проекты", en: "Top Projects" },
  "landing.topProjectsDesc": { ru: "Самые популярные проекты сообщества", en: "Most liked projects from the community" },

  // Login
  "login.title": { ru: "С возвращением", en: "Welcome Back" },
  "login.subtitle": { ru: "Войдите в свой аккаунт Dev Club", en: "Sign in to your Dev Club account" },
  "login.email": { ru: "Email", en: "Email" },
  "login.password": { ru: "Пароль", en: "Password" },
  "login.submit": { ru: "Войти", en: "Login" },
  "login.demo": { ru: "Демо-аккаунты:", en: "Demo Accounts:" },
  "login.noAccount": { ru: "Нет аккаунта?", en: "Don't have an account?" },
  "login.welcome": { ru: "С возвращением!", en: "Welcome back!" },
  "login.invalid": { ru: "Неверные данные", en: "Invalid credentials" },
  "login.invalidDesc": { ru: "Проверьте email и пароль.", en: "Please check your email and password." },

  // Register
  "register.title": { ru: "Присоединяйтесь к Dev Club", en: "Join Dev Club" },
  "register.subtitle": { ru: "Создайте аккаунт и начните создавать", en: "Create your account and start building" },
  "register.name": { ru: "Полное имя", en: "Full Name" },
  "register.nickname": { ru: "Никнейм", en: "Nickname" },
  "register.avatar": { ru: "Аватар", en: "Avatar" },
  "register.role": { ru: "Роль", en: "Role" },
  "register.submit": { ru: "Создать аккаунт", en: "Create Account" },
  "register.hasAccount": { ru: "Уже есть аккаунт?", en: "Already have an account?" },
  "register.welcome": { ru: "Добро пожаловать в Dev Club!", en: "Welcome to Dev Club!" },
  "register.failed": { ru: "Ошибка регистрации", en: "Registration failed" },
  "register.failedDesc": { ru: "Email уже используется.", en: "Email already in use." },

  // Roles
  "role.student": { ru: "Студент", en: "Student" },
  "role.mentor": { ru: "Ментор", en: "Mentor" },
  "role.alumni": { ru: "Выпускник", en: "Alumni" },
  "role.student.desc": { ru: "Создание проектов и команд", en: "Create projects & teams" },
  "role.mentor.desc": { ru: "Стажировки и блог", en: "Create internships & blog posts" },
  "role.alumni.desc": { ru: "Просмотр и комментарии", en: "View & comment" },

  // Projects
  "projects.title": { ru: "Проекты", en: "Projects" },
  "projects.subtitle": { ru: "Исследуйте студенческие проекты", en: "Explore student projects" },
  "projects.new": { ru: "Новый проект", en: "New Project" },
  "projects.create": { ru: "Создать проект", en: "Create Project" },
  "projects.titleField": { ru: "Название проекта", en: "Project title" },
  "projects.description": { ru: "Описание", en: "Description" },
  "projects.githubLink": { ru: "Ссылка на GitHub", en: "GitHub link" },
  "projects.createBtn": { ru: "Создать", en: "Create" },
  "projects.empty": { ru: "Пока нет проектов", en: "No projects yet" },
  "projects.emptyDesc": { ru: "Будьте первым, кто создаст проект!", en: "Be the first to create a project!" },
  "projects.viewGithub": { ru: "Смотреть на GitHub", en: "View on GitHub" },
  "projects.by": { ru: "автор", en: "by" },
  "projects.likes": { ru: "нравится", en: "likes" },
  "projects.comments": { ru: "комментарии", en: "comments" },
  "projects.addComment": { ru: "Написать комментарий...", en: "Write a comment..." },
  "projects.post": { ru: "Отправить", en: "Post" },
  "projects.saved": { ru: "Сохранено", en: "Saved" },
  "projects.topProjects": { ru: "Популярные проекты", en: "Top Projects" },

  // Blog
  "blog.title": { ru: "Блог", en: "Blog" },
  "blog.subtitle": { ru: "Статьи от менторов", en: "Insights from mentors" },
  "blog.new": { ru: "Новая запись", en: "New Post" },
  "blog.create": { ru: "Создать запись", en: "Create Blog Post" },
  "blog.titleField": { ru: "Заголовок", en: "Post title" },
  "blog.content": { ru: "Напишите вашу запись...", en: "Write your post..." },
  "blog.publish": { ru: "Опубликовать", en: "Publish" },
  "blog.empty": { ru: "Пока нет записей", en: "No blog posts yet" },
  "blog.emptyDesc": { ru: "Загляните позже за статьями от менторов.", en: "Check back later for insights from mentors." },

  // Internships
  "internships.title": { ru: "Стажировки", en: "Internships" },
  "internships.subtitle": { ru: "Возможности от менторов", en: "Opportunities from mentors" },
  "internships.new": { ru: "Новая стажировка", en: "New Internship" },
  "internships.create": { ru: "Создать стажировку", en: "Create Internship" },
  "internships.titleField": { ru: "Название стажировки", en: "Internship title" },
  "internships.createBtn": { ru: "Создать", en: "Create" },
  "internships.empty": { ru: "Пока нет стажировок", en: "No internships yet" },
  "internships.emptyDesc": { ru: "Менторы скоро опубликуют возможности.", en: "Mentors will post opportunities soon." },
  "internships.apply": { ru: "Подать заявку", en: "Apply" },
  "internships.applied": { ru: "Заявка подана", en: "Applied" },
  "internships.applyTitle": { ru: "Подать заявку на стажировку", en: "Apply for Internship" },
  "internships.coverLetter": { ru: "Сопроводительное письмо (необязательно)", en: "Cover letter (optional)" },
  "internships.submitApplication": { ru: "Отправить заявку", en: "Submit Application" },
  "internships.description": { ru: "Описание стажировки", en: "Internship description" },

  // Teams
  "teams.title": { ru: "Команды", en: "Teams" },
  "teams.subtitle": { ru: "Сотрудничество с другими студентами", en: "Collaborate with other students" },
  "teams.create": { ru: "Создать команду", en: "Create Team" },
  "teams.name": { ru: "Название команды", en: "Team name" },
  "teams.description": { ru: "Описание команды", en: "Team description" },
  "teams.goals": { ru: "Цели команды", en: "Team goals" },
  "teams.category": { ru: "Категория", en: "Category" },
  "teams.public": { ru: "Публичная", en: "Public" },
  "teams.private": { ru: "Приватная", en: "Private" },
  "teams.leader": { ru: "лидер", en: "leader" },
  "teams.member": { ru: "участник", en: "member" },
  "teams.leave": { ru: "Покинуть", en: "Leave" },
  "teams.createBtn": { ru: "Создать", en: "Create" },
  "teams.empty": { ru: "Пока нет команд", en: "No teams yet" },
  "teams.emptyDesc": { ru: "Создайте команду для совместной работы!", en: "Create a team to start collaborating!" },
  "teams.join": { ru: "Присоединиться", en: "Join Team" },
  "teams.members": { ru: "участник(ов)", en: "member(s)" },
  "teams.denied": { ru: "Только студенты могут получить доступ к странице команд.", en: "Only students can access the teams page." },

  // Profile
  "profile.myProjects": { ru: "Мои проекты", en: "My Projects" },
  "profile.myTeams": { ru: "Мои команды", en: "My Teams" },
  "profile.myInternships": { ru: "Мои стажировки", en: "My Internships" },
  "profile.myBlogPosts": { ru: "Мои записи в блоге", en: "My Blog Posts" },
  "profile.savedProjects": { ru: "Сохранённые проекты", en: "Saved Projects" },
  "profile.activity": { ru: "Активность", en: "Activity" },
  "profile.noProjects": { ru: "Пока нет проектов", en: "No projects yet" },
  "profile.createFirst": { ru: "Создайте свой первый проект!", en: "Create your first project!" },
  "profile.noTeams": { ru: "Нет команды", en: "Not in any team" },
  "profile.joinFirst": { ru: "Присоединитесь или создайте команду!", en: "Join or create a team!" },
  "profile.noInternships": { ru: "Пока нет стажировок", en: "No internships yet" },
  "profile.createFirstInternship": { ru: "Создайте свою первую стажировку!", en: "Create your first internship!" },
  "profile.noBlogPosts": { ru: "Пока нет записей", en: "No blog posts yet" },
  "profile.shareKnowledge": { ru: "Поделитесь своими знаниями!", en: "Share your knowledge!" },
  "profile.noSaved": { ru: "Нет сохранённых проектов", en: "No saved projects" },
  "profile.noSavedDesc": { ru: "Сохраняйте понравившиеся проекты!", en: "Bookmark projects you like!" },
  "profile.leaveComment": { ru: "Оставьте комментарий...", en: "Leave a comment..." },
  "profile.editProfile": { ru: "Редактировать профиль", en: "Edit Profile" },
  "profile.save": { ru: "Сохранить", en: "Save" },
  "profile.cancel": { ru: "Отмена", en: "Cancel" },
  "profile.applications": { ru: "Мои заявки на стажировки", en: "My Internship Applications" },
  "profile.noApplications": { ru: "Нет заявок", en: "No applications" },
  "profile.noApplicationsDesc": { ru: "Подайте заявку на интересную стажировку!", en: "Apply for an interesting internship!" },
  "profile.noMessage": { ru: "Без сообщения", en: "No message" },
  "profile.pending": { ru: "Ожидает", en: "Pending" },
  "profile.accepted": { ru: "Принята", en: "Accepted" },
  "profile.rejected": { ru: "Отклонена", en: "Rejected" },
  "profile.internshipApplications": { ru: "Заявки на стажировки", en: "Internship Applications" },
  "profile.noApplicationsMentor": { ru: "Пока нет заявок на ваши стажировки.", en: "No applications for your internships yet." },
  "profile.editInternship": { ru: "Редактировать стажировку", en: "Edit Internship" },
  "profile.editBlogPost": { ru: "Редактировать запись", en: "Edit Blog Post" },
  "profile.edit": { ru: "Редактировать", en: "Edit" },
  "profile.delete": { ru: "Удалить", en: "Delete" },

  // Access Denied
  "access.denied": { ru: "Доступ запрещён", en: "Access Denied" },
  "access.noPermission": { ru: "У вас нет прав доступа к этой функции.", en: "You don't have permission to access this feature." },
  "access.goHome": { ru: "На главную", en: "Go Home" },

  // Not Found
  "notFound.title": { ru: "Страница не найдена", en: "Oops! Page not found" },
  "notFound.back": { ru: "Вернуться на главную", en: "Return to Home" },

  // Notifications
  "notifications.title": { ru: "Уведомления", en: "Notifications" },
  "notifications.empty": { ru: "Нет уведомлений", en: "No notifications" },
  "notifications.markAllRead": { ru: "Отметить все прочитанными", en: "Mark all as read" },

  // Footer
  "footer.text": { ru: "© 2026 Dev Club. Создано разработчиками для разработчиков.", en: "© 2026 Dev Club. Built for developers, by developers." },
} as const;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");

  const t = (key: TranslationKey): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
