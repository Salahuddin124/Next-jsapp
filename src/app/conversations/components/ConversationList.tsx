"use client";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { MdOutlineGroupAdd,MdCheck, MdClose } from "react-icons/md";
import { User } from "@prisma/client";
import { find } from "lodash";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import GroupChatModal from "../../components/modals/GroupChatModal";
import useConversation from "../../hooks/useConversation";
const { pusherClient,pusherEvents} = require('@/lib/pusher');
import { FullConversationType } from "../../types";
import ConversationBox from "./ConversationBox";
import Modal from "@/app/components/modals/Modal";

interface ConversationListProps {
  initialItems: FullConversationType[];
  users: User[];
}

interface FriendRequest {
  _id: number;
  name: string;
  email: string;
  sender:{
    name: string;
    email:string;
  }
  status: string; // Added status field
}

const ConversationList: React.FC<ConversationListProps> = ({ initialItems, users }) => {
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("allChats");
  const [contacts, setContacts] = useState([{name:"",id:"",email:""}]);

  const [isFriendRequestModalOpen, setIsFriendRequestModalOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]); // Initialize as empty array

  const router = useRouter();
  const session = useSession();

  const { conversationId, isOpen } = useConversation();

  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  useEffect(() => {
    if (!pusherKey) {
      return;
    }
    

    pusherClient.subscribe(pusherKey);

    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) =>
        current.map((currentConversation) => {
          if (currentConversation.id === conversation.id) {
            return {
              ...currentConversation,
              messages: conversation.messages,
            };
          }

          return currentConversation;
        })
      );
    };

    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        // skip if the conversation already exists
        if (find(current, { id: conversation.id })) {
          return current;
        }

        return [conversation, ...current];
      });
    };

    const removeHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        return [...current.filter((convo) => convo.id !== conversation.id)];
      });

      if (conversationId == conversation.id) {
        router.push("/conversations");
      }
    };

    pusherClient.bind(pusherEvents.UPDATE_CONVERSATION, updateHandler);
    pusherClient.bind(pusherEvents.NEW_CONVERSATION, newHandler);
    pusherClient.bind(pusherEvents.DELETE_CONVERSATION, removeHandler);

    return () => {
      pusherClient.unbind(pusherEvents.UPDATE_CONVERSATION, updateHandler);
      pusherClient.unbind(pusherEvents.NEW_CONVERSATION, newHandler);
      pusherClient.unbind(pusherEvents.DELETE_CONVERSATION, removeHandler);
    };
  }, [conversationId, pusherKey, router]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const senderEmail = userData.email;
    
        const response = await fetch(`https://messengerclone-production.up.railway.app/api/users/${senderEmail}/received-requests`);
        if (!response.ok) {
          throw new Error("Failed to fetch friend requests");
        }
        const data = await response.json();
        console.log(data)
        setFriendRequests(data);
       
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };

fetchFriendRequests()

  }, [activeTab]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const senderEmail = userData.email;
        const response = await fetch(`https://messengerclone-production.up.railway.app/api/users/${senderEmail}/contacts`);
        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  const handleFriendRequestModalOpen = () => {
    setIsFriendRequestModalOpen(true);
  };

  const handleFriendRequestModalClose = () => {
    setIsFriendRequestModalOpen(false);
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      const response = await fetch(`https://messengerclone-production.up.railway.app/api/users/friend-requests/${request._id}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      // Update state or fetch friend requests again to reflect changes
      setFriendRequests((current) =>
        current.map((r) => (r._id === request._id ? { ...r, status: "accepted" } : r))
      
      );
      setFriendRequests((current) => current.filter((r) => r._id !== request._id));
     
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    try {
      const response = await fetch(`https://messengerclone-production.up.railway.app/api/users/friend-requests/${request._id}/reject`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to reject friend request");
      }

      // Remove the request from state
      setFriendRequests((current) => current.filter((r) => r._id !== request._id));
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  return (
    <>
      <GroupChatModal users={users} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Modal isOpen={isFriendRequestModalOpen} onClose={handleFriendRequestModalClose}>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Received Friend Requests</h2>
          <div className="space-y-4">
            {friendRequests?.map((request) => (
              <div key={request._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{request.name}</h3>
                    <p className="text-sm text-gray-500">{request.email}</p>
                  </div>
                  {request.status === "pending" && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleFriendRequestModalClose}
            className="mt-4 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </Modal>
      <aside
        className={clsx(
          `
          fixed 
          inset-y-0 
          pb-20
          lg:pb-0
          lg:left-20 
          lg:w-80 
          lg:block
          overflow-y-auto 
          border-r 
          border-gray-200 
          dark:border-lightgray
        `,
          isOpen ? "hidden" : "block w-full left-0"
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-neutral-800 dark:text-gray-200">Messages</div>
          </div>
          <div className="flex space-x-2 mb-4">
            <button
              className={clsx(
                "py-1 px-3 rounded-full text-sm",
                activeTab === "allChats"
                  ? "bg-gray-800 text-white dark:bg-gray-700"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              )}
              onClick={() => setActiveTab("allChats")}
            >
              All Chats
            </button>
            <button
              className={clsx(
                "py-1 px-3 rounded-full text-sm relative",
                activeTab === "groups"
                  ? "bg-gray-800 text-white dark:bg-gray-700"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              )}
              onClick={() => {
                setActiveTab("groups");
             
              }}
            >
             Groups
             
            </button>
            <button
              className={clsx(
                "py-1 px-3 rounded-full text-sm relative",
                activeTab === "contacts"
                  ? "bg-gray-800 text-white dark:bg-gray-700"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              )}
              onClick={() => setActiveTab("contacts")}
            >
              Contacts
              {friendRequests?.filter((r) => r.status === "pending").length > 0 && (
                <span className="absolute right-0 -top-4 bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                  {friendRequests.filter((r) => r.status === "pending").length}
                </span>
              )}
            </button>
          </div>
        </div>
        {activeTab === "allChats" && (
          <div className="overflow-y-auto">
            {items.map((item) => (
              <ConversationBox
                key={item.id}
                data={item}
                selected={conversationId === item.id}
              />
            ))}
          </div>
        )}
        {activeTab === "groups" && (
          <div className="px-5">
            <div className="mb-4">
              {/* Add your friend requests content here */}
            </div>
          </div>
        )}


{activeTab === "contacts" && (
  <>
    <div className="px-5">
      <div className="mb-4">
        {/* <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contacts</h1> */}
        <div className="mt-6 space-y-4">
          {friendRequests.map((request) => (
            <div key={request._id} className="border rounded-lg shadow-sm p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate"
                    style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
                  >
                    {request.sender.name}
                  </h3>
                  <p
                    className="text-sm text-gray-500 dark:text-gray-400 truncate"
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                  >
                    {request.sender.email}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request)}
                    className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <MdCheck size={20} />
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request)}
                    className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {contacts?.map((contact) => (
          <div key={contact.id} className="border rounded-lg shadow-sm p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate"
                  style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
                >
                  {contact.name}
                </h3>
                <p
                  className="text-sm text-gray-500 dark:text-gray-400 truncate"
                  style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                >
                  {contact.email}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
)}






      </aside>
      
      
    </>
  );
};

export default ConversationList;
