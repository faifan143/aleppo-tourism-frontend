import React, { FC, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const { user, accessToken } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Log authentication state for debugging
    console.log("AuthGuard - Current path:", pathname);
    console.log("AuthGuard - Auth state:", { user, accessToken });
  }, [user, accessToken, pathname]);

  return <>{children}</>;
};

export default AuthGuard;
