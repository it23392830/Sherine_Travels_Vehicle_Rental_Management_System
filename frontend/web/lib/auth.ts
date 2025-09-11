export type UserRole = "Manager" | "Driver" | "User" | "Owner";

export interface User {
  email: string;
  fullName: string;
  role: UserRole;
  token: string;
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  Manager: "/dashboard/manager",
  Driver: "/dashboard/driver",
  User: "/dashboard/user",
  Owner: "/dashboard/owner",
};

export const AuthService = {
  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("sherine_auth_user");
      if (userStr) return JSON.parse(userStr);
    }
    return null;
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("sherine_auth_token");
    }
    return null;
  },

  async login(email: string, password: string): Promise<User> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = "Login failed";
      try {
        const body = await res.json();
        message = body?.message || body?.error || body || message;
      } catch {
        try {
          message = await res.text();
        } catch {}
      }
      throw new Error(message || "Invalid credentials");
    }

    const data = await res.json();

    // Backend returns: { token, roles }
    const user: User = {
      email,
      fullName: email.split("@")[0], // fallback, since backend doesn’t return full name
      role: (data.roles?.[0] as UserRole) ?? "User",
      token: data.token,
    };

    if (typeof window !== "undefined") {
      // ✅ Store token and user in localStorage
      localStorage.setItem("sherine_auth_token", data.token);
      localStorage.setItem("sherine_auth_user", JSON.stringify(user));
    }

    return user;
  },

  async signup(fullName: string, email: string, password: string, userType: "User" | "Driver") {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register?userType=${userType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!res.ok) {
      let message = "Signup failed";
      try {
        const body = await res.json();
        message = body?.message || body?.error || body || message;
      } catch {
        try {
          message = await res.text();
        } catch {}
      }
      throw new Error(message || "Signup failed");
    }

    return await res.json();
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sherine_auth_user");
      localStorage.removeItem("sherine_auth_token");
    }
  },
};
