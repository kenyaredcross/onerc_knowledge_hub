import {
  useFrappeAuth,
  useFrappeGetCall,
  useSWRConfig,
} from "frappe-react-sdk";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { UserContext } from "./UserContext";

export const UserProvider = ({ children }) => {
  const { mutate } = useSWRConfig();
  const { logout, currentUser, updateCurrentUser, isLoading } = useFrappeAuth();
  const location = useLocation();

  const user = useFrappeGetCall(
    "onerc_knowledge_hub.api.user.get_user_details",
    {},
  );

  const userData = user?.data?.message;

  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("app-cache");

    try {
      if (window.frappePushNotification) {
        await window.frappePushNotification.disableNotification();
      }
    } catch (error) {
      console.error("Failed to disable push notifications", error);
    }

    return logout()
      .then(() => {
        return mutate(
          (key) => {
            if (key === "onerc_knowledge_hub.api.login.get_context") {
              return false;
            }
            return true;
          },
          undefined,
          false,
        );
      })
      .then(() => {
        // Use window.location.href to force full page reload after logout
        window.location.href = "/ans-hub/login";
      })
      .catch((error) => {
        toast.error("Failed to logout", {
          description: error.message || "An unexpected error occurred",
        });
        // Still redirect on error
        window.location.href = "/ans-hub/login";
      });
  };

  return (
    <UserContext.Provider
      value={{
        isLoading,
        updateCurrentUser,
        logout: handleLogout,

        currentUser: currentUser,
        userData: userData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
