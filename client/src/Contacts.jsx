import { useLocation, useNavigate } from "react-router-dom";
import { ProfileHeader } from "./components/ui/ProfileHeader";
import { useEffect, useState } from "react";
import { LatestConversation } from "./components/ui/LatestConversation";
import { ActivityFeed } from "./components/ui/ActivityFeed";
import ActivityTrends from "./components/ui/ActivityTrend";
import { LoaderCircleIcon } from "lucide-react";
import { ScrollArea } from "./components/ui/scroll-area";

export default function Contacts() {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(() => {
    if (location.state) {
      window.localStorage.setItem("data", JSON.stringify(location.state));
    }
    const data = window.localStorage.getItem("data");
    return data ? JSON.parse(data) : location.state;
  });

  useEffect(() => {
    if (location.state) {
      window.localStorage.setItem("data", JSON.stringify(location.state));
      setData(location.state);
    }
  }, [location.state]);

  if (!data) {
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        <LoaderCircleIcon className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  let activity =
    data.account.emailMessagesGroupedByContact[data.contact.ID] || [];
  for (let event of data.account.events) {
    if (event.WHO_ID === data.contact.ID) {
      activity.push(event);
    }
  }
  activity = activity
    .map((obj) => {
      obj = { ...obj }; 

      if (obj.Date) {
        obj.commonDate = new Date(obj.Date);
      } else if (obj.ACTIVITY_DATE_TIME) {
        obj.commonDate = new Date(obj.ACTIVITY_DATE_TIME);
      }
      return obj;
    })
    .sort((a, b) => a.commonDate - b.commonDate);
  return (
    <div className="bg-white text-gray-800 h-screen w-screen flex justify-center overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <button
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-full flex items-center shadow-md hover:bg-gray-300 transition"
          onClick={() => navigate("/")}
        >
          <span className="material-icons"> ← </span>
        </button>
      </div>
      <div className="flex  flex justify-center  h-full w-full">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 overflow-hidden">
          <ProfileHeader
            contactInfo={data.contact}
            account={data.account}
            avatar={data.avatar}
          />
          <ScrollArea className="rounded-md h-full">
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-4">
                  <LatestConversation
                    emailMessage={
                      data.account.emailMessagesGroupedByContact[
                        data.contact.ID
                      ]
                    }
                    contactInfo={data.contact}
                  />
                </div>
                <div className="bg-white rounded-3xl p-4">
                  <ActivityFeed activities={activity} contact={data.contact} />
                </div>
                <div className="col-span-1 lg:col-span-1 bg-white rounded-3xl p-4">
                  <ActivityTrends
                    activities={activity}
                    emailData={
                      data.account.emailMessagesGroupedByContact[
                        data.contact.ID
                      ]
                    }
                    contact={data.contact}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
