export function getCurrentUserName(): string {
  if (typeof window === "undefined") return "Customer"
  
  try {
    const raw = window.localStorage.getItem("sherine_auth_user")
    if (raw) {
      const user = JSON.parse(raw)
      return user.fullName || "Customer"
    }
  } catch {
    // Fallback if parsing fails
  }
  
  return "Customer"
}
