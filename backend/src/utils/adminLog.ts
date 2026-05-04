export const logAdminAction = (adminId: string, action: string, targetId: string) => {
  const logEntry = {
    adminId,
    action,
    targetId,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(logEntry));
};
