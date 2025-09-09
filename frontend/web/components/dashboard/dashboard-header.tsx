import React from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => (
  <header className="mb-6">
    <h1 className="text-3xl font-bold text-primary mb-1">{title}</h1>
    {subtitle && <p className="text-muted-foreground text-lg">{subtitle}</p>}
  </header>
);
