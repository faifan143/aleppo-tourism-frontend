"use client";
import LoadingProvider from "@/hooks/LoadingProvider";
import { persistor, store } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AuthGuard from "./AuthGuard";
import { MokkBarProvider } from "./MokkBarContext";
import Header from "../Header";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

const LayoutProviders = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => {
  const pathname = usePathname();

  // Create a client with unique instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // Consider data always stale by default
        gcTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes
        retry: 1,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    },
  }));

  // Don't show header on auth pages or admin pages
  const shouldShowHeader = !pathname.includes('/login') &&
    !pathname.includes('/admin') &&
    !pathname.includes('/register') &&
    !pathname.includes('/admin-login');

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <LoadingProvider>
              <AuthGuard>
                <MokkBarProvider>
                  <div className="flex flex-col min-h-screen">
                    {shouldShowHeader && <Header />}
                    <main className="flex-grow">{children}</main>
                    <Toaster position="top-center" />
                  </div>
                </MokkBarProvider>
              </AuthGuard>
            </LoadingProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </>
  );
};

export default LayoutProviders;
