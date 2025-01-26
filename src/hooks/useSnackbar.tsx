import { useState } from "react";

const useSnackbar = () => {
  const [snackbarConfig, setSnackbarConfig] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "info" | "warning" | "error",
  });

  return { snackbarConfig, setSnackbarConfig };
};

export default useSnackbar;
