"use client";

import { setLaoding } from "@/redux/reducers/wrapper.slice";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";

interface RouteWrapperProps {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({
  href,
  children,
  onClick,
  className = "",
}) => {
  const dispatchAction = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();

  const handleRoute = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== pathname) dispatchAction(setLaoding(true));
    if (onClick) onClick();
    router.push(href);
  };

  useEffect(() => {
    if (pathname) {
      dispatchAction(setLaoding(false));
    }
  }, [dispatchAction, pathname]);

  return (
    <Link href={href} className={className} onClick={handleRoute}>
      {children}
    </Link>
  );
};

export default RouteWrapper;
