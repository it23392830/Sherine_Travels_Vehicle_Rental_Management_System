export type UserRole = "manager" | "driver" | "user" | "owner";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  manager: "/dashboard/manager",
  driver: "/dashboard/driver",
  user: "/dashboard/user",
  owner: "/dashboard/owner",
};

export const AuthService = {
  getCurrentUser(): User | null {
    // Dummy implementation for demo
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("sherine_auth_user");
      if (userStr) return JSON.parse(userStr);
    }
    return null;
  },
  getToken(): string {
    // Dummy token
    return "demo-token";
  },
  async login(
    email: string,
    password: string,
    clientInfo?: any
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    // Dummy login logic
    if (email === "manager@sherine.com" && password === "manager123") {
      const user: User = { id: 1, email, name: "Manager", role: "manager" };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sherine_auth_user", JSON.stringify(user));
      }
      return { success: true, user };
    }
    return { success: false, error: "Invalid credentials" };
  },
  logout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("sherine_auth_user");
    }
  },
};
