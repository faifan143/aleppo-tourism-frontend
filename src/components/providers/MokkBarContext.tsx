// MokkBarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import CustomizedSnackbars from "../ui/CustomizedSnackbars";

type Severity = "success" | "error" | "warning" | "info";

interface SnackbarConfig {
  open: boolean;
  message: string;
  severity: Severity;
}

interface MokkBarContextType {
  snackbarConfig: SnackbarConfig;
  setSnackbarConfig: React.Dispatch<React.SetStateAction<SnackbarConfig>>;
}

const MokkBarContext = createContext<MokkBarContextType | undefined>(undefined);

const defaultConfig: SnackbarConfig = {
  open: false,
  message: "",
  severity: "info",
};

export const MokkBarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [snackbarConfig, setSnackbarConfig] =
    useState<SnackbarConfig>(defaultConfig);

  return (
    <MokkBarContext.Provider value={{ snackbarConfig, setSnackbarConfig }}>
      {children}
      <CustomizedSnackbars
        open={snackbarConfig.open}
        message={snackbarConfig.message}
        severity={snackbarConfig.severity}
        onClose={() => setSnackbarConfig((prev) => ({ ...prev, open: false }))}
      />
    </MokkBarContext.Provider>
  );
};

export const useMokkBar = () => {
  const context = useContext(MokkBarContext);
  if (context === undefined) {
    throw new Error("useMokkBar must be used within a MokkBarProvider");
  }
  return context;
};

// Usage examples:
/*
// 1. Wrap your app with the provider:
function App() {
  return (
    <MokkBarProvider>
      <YourComponents />
    </MokkBarProvider>
  );
}

// 2. Use the snackbar in any component:
function YourComponent() {
  const { setSnackbarConfig } = useMokkBar();

  const handleSuccess = () => {
    setSnackbarConfig({
      open: true,
      severity: 'success',
      message: 'تم فتح وردية',
    });
  };

  return (
    <button onClick={handleSuccess}>
      Show Success
    </button>
  );
}
*/
