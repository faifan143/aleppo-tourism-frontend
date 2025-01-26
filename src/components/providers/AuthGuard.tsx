import React, { FC } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const {} = useAuth();

  return <>{children}</>;
};

export default AuthGuard;
