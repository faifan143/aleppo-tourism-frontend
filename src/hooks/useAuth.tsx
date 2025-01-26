import { selectAccessToken, selectUser } from "@/redux/reducers/userSlice";
import { useSelector } from "react-redux";

export const useAuth = () => {
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAccessToken);

  // useEffect(() => {
  //   if (!user || !accessToken) {
  //     router.push("/login");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user, accessToken]);

  return { user, accessToken };
};
