import { useMemo, useState } from "react";
import { HiChat } from "react-icons/hi";
import { HiArrowLeftOnRectangle, HiUsers } from "react-icons/hi2";
import { HiHome, HiSearch, HiBookmark, HiUserAdd } from "react-icons/hi";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import useConversation from "./useConversation";
import { MdOutlineGroupAdd } from "react-icons/md";
const useRoutes = () => {
  const pathname = usePathname();
  const { conversationId } = useConversation();
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  const handleToggleAddFriendModal = () => {
    setIsAddFriendModalOpen(!isAddFriendModalOpen);
  };

  const routes = useMemo(
    () => [
      {
        label: "Home",
        href: "/home",
        icon: HiHome,
        active: pathname === "/home",
      },
      {
        label: "Search",
        href: "/search",
        icon: HiSearch,
        active: pathname === "/search",
      },
      {
        label: "Saved",
        href: "/saved",
        icon: HiBookmark,
        active: pathname === "/saved",
      },
      {
        label: "Add Friend",
        href: "#",
        icon: HiUserAdd,
        onClick: handleToggleAddFriendModal,
        active: false, // Adjust if needed
      },
      {
        label: "Chat",
        href: "/conversations",
        icon: HiChat,
        active: pathname === "/conversations" || !!conversationId,
      },
      {
        label: "Users",
        href: "/users",
        icon: HiUsers,
        active: pathname === "/users",
      },
      // {
      //   label: "Users",
      //   href: "/users",
      //   icon: MdOutlineGroupAdd,
      //   active: pathname === "/users",
      // },
      {
        label: "Logout",
        onClick: () => signOut(),
        href: "#",
        icon: HiArrowLeftOnRectangle,
        active: false,
      },
    ],
    [pathname, conversationId, isAddFriendModalOpen]
  );

  return { routes, isAddFriendModalOpen, handleToggleAddFriendModal };
};

export default useRoutes;
