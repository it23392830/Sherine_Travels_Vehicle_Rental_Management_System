import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface RouteGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.push("/");
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!user || !allowedRoles.includes(user.role)) return null;
  return <>{children}</>;
};
