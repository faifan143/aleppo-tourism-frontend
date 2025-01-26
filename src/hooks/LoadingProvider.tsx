"use client";

import PageSpinner from "@/components/ui/PageSpinner";
import { setLaoding } from "@/redux/reducers/wrapper.slice";
import { AppDispatch, RootState } from "@/redux/store";
import React, { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

interface LoadingProviderProps {
  children: ReactNode;
}

const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const isLoading = useSelector(
    (state: RootState) => state.user.wrapper.isLoading
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!user.accessToken || !user.user) {
      dispatch(setLaoding(false));
    }
  }, [dispatch, isLoading, user.accessToken, user.user]);

  return (
    <>
      {(user.status == "loading" || isLoading) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/5 z-50">
          <PageSpinner />
        </div>
      )}
      {children}
    </>
  );
};

export default LoadingProvider;
