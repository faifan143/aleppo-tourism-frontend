"use client";
import LoadingProvider from "@/hooks/LoadingProvider";
import { persistor, store } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AuthGuard from "./AuthGuard";
import { MokkBarProvider } from "./MokkBarContext";

const LayoutProviders = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => {
  return (
    <>
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: {
              queries: {
                staleTime: 1000 * 60 * 5,
                gcTime: 1000 * 60 * 30,
                retry: 1,
                refetchOnWindowFocus: false,
              },
            },
          })
        }
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <LoadingProvider>
              <AuthGuard>
                <MokkBarProvider>{children}</MokkBarProvider>
              </AuthGuard>
            </LoadingProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </>
  );
};

export default LayoutProviders;
