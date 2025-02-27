// Simple auth utility functions

export const auth = {
  isAuthenticated(): boolean {
    return (
      localStorage.getItem("isAuthenticated") === "true" ||
      sessionStorage.getItem("isAuthenticated") === "true"
    );
  },

  isAdmin(): boolean {
    return (
      (localStorage.getItem("isAdmin") === "true" ||
        sessionStorage.getItem("isAdmin") === "true") &&
      this.isAuthenticated()
    );
  },

  getUser(): { email: string; role: string } | null {
    const userStr =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("user");
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("isAdmin");
    sessionStorage.removeItem("user");
  },
};
