import { selectAccessToken, selectUser } from "@/redux/reducers/userSlice";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export const useAuth = () => {
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAccessToken);

  useEffect(() => {
    console.log("useAuth hook - current auth state:", { user, accessToken });
  }, [user, accessToken]);

  // useEffect(() => {
  //   if (!user || !accessToken) {
  //     router.push("/login");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user, accessToken]);

  return { user, accessToken };
};
