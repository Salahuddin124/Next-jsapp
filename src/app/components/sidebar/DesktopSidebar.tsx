'use client'
import { useEffect, useState } from "react";
import clsx from "clsx";
import { User } from "@prisma/client";
import axios from "axios";
import useRoutes from "../../hooks/useRoutes";
import ThemeToggle from "../theme/ThemeToggle";
import DesktopItem from "./DesktopItem";
import ProfileItem from "./ProfileItem";
import Modal from "../modals/Modal";

interface DesktopSidebarProps {
  currentUser: User;
}

interface FriendRequest {
  id: number;
  name: string;
  email: string;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const { routes, isAddFriendModalOpen, handleToggleAddFriendModal } = useRoutes();
  const [activeTab, setActiveTab] = useState("allChats");
  const [friendRequestsCount, setFriendRequestsCount] = useState(3);
  
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [receivedFriendRequests, setReceivedFriendRequests] = useState<FriendRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);

  useEffect(() => {
    setFriendRequestsCount(3);
    
    const fetchedFriendRequests: FriendRequest[] = [
      { id: 1, name: "John Doe", email: "john.doe@example.com" },
      { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
      { id: 3, name: "Michael Johnson", email: "michael.johnson@example.com" },
    ];
    setReceivedFriendRequests(fetchedFriendRequests);
  }, []);

  const handleOpenSecondModal = () => {
    setIsSecondModalOpen(true);
  };

  const handleCloseSecondModal = () => {
    setIsSecondModalOpen(false);
  };

  const handleAcceptRequest = (request: FriendRequest) => {
    console.log(`Accepted friend request from ${request.name}`);
  };

  const handleRejectRequest = (request: FriendRequest) => {
    console.log(`Rejected friend request from ${request.name}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const formData = new FormData(event.currentTarget);
    const friendName = formData.get("friendName") as string;
    const friendEmail = formData.get("friendEmail") as string;
  
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const senderEmail = userData.email;
  
      const response = await axios.post("`https://messengerclone-production.up.railway.app/api/users/send-request", {
        senderEmail,
        receiverEmail: friendEmail,
      });
  
      console.log("Friend added successfully:", response.data);
      handleToggleAddFriendModal()
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };
  
  return (
    <>
      <div
        className="
          hidden 
          lg:fixed 
          lg:inset-y-0 
          lg:left-0 
          lg:z-40 
          lg:w-20 
          xl:px-6
          lg:overflow-y-auto 
          lg:bg-white 
          lg:border-r-[1px]
          lg:pb-4
          lg:flex
          lg:flex-col
          justify-between
          dark:bg-dusk
          dark:border-lightgray
        "
      >
        <nav className="mt-4 flex flex-col justify-between">
          <ul role="list" className="flex flex-col items-center space-y-1">
            {routes.map((item) => (
              <DesktopItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.active}
                onClick={item.onClick}
              />
            ))}
          </ul>
        </nav>
        <nav className="mt-4 flex flex-col justify-between items-center">
          <ThemeToggle />
          <ProfileItem currentUser={currentUser} />
        </nav>
      </div>

      <Modal isOpen={isAddFriendModalOpen} onClose={handleToggleAddFriendModal}>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg ">
          <div className="flex justify-end mb-4 relative">
            {/* <button
              className={clsx(
                "py-1 px-3 rounded-full text-sm relative",
                activeTab === "allChats"
                  ? "bg-gray-800 text-white dark:bg-gray-700"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              )}
              onClick={handleOpenSecondModal}
            > */}
              {/* Friend Requests
              {friendRequestsCount > 0 && (
                <span className="absolute left-0 -top-4 bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                  {friendRequestsCount}
                </span>
              )}
            </button> */}
          </div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Add Friend</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="friendName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                id="friendName"
                name="friendName"
                type="text"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                placeholder="Enter friend's name"
                required
              />
            </div>
            <div>
              <label htmlFor="friendEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                id="friendEmail"
                name="friendEmail"
                type="email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100 dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                placeholder="Enter friend's email address"
                required
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Friend
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {isSecondModalOpen && (
        <Modal isOpen={isSecondModalOpen} onClose={handleCloseSecondModal}>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Received Friend Requests</h2>
            <div className="space-y-4">
              {receivedFriendRequests.map((request) => (
                <div key={request.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{request.name}</h3>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request)}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request)}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCloseSecondModal}
              className="mt-4 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default DesktopSidebar;
