import { useState } from "react";
import { Mail, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export function ActivityList({ activities, contact }) {
  const [filter, setFilter] = useState("all");

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    if (filter === "meeting") return !activity.EmailId;
    if (filter === "email") return !!activity.EmailId;
    return true;
  });
  console.log(filteredActivities);
  return (
    <div className="space-y-4">
      <Select value={filter} onValueChange={(value) => setFilter(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter activities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All activities</SelectItem>
          <SelectItem value="meeting">Meetings</SelectItem>
          <SelectItem value="email">Emails</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-4">
        {filteredActivities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            {activity.EmailId ? (
              <>
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {contact.FIRST_NAME} {contact.LAST_NAME} sent an email to{" "}
                    {activity.ToAddress.split("; ").map((address, index) => (
                      <span key={index}>
                        {address}
                        {index < activity.ToAddress.split("; ").length - 1
                          ? ", "
                          : ""}
                      </span>
                    ))}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(activity.Date)}
                  </p>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(activity.Date)}
                </span>
              </>
            ) : (
              <>
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {contact.FIRST_NAME} {contact.LAST_NAME} had a meeting for{" "}
                    {activity.SUBJECT}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(activity.ACTIVITY_DATE_TIME)}
                  </p>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(activity.ACTIVITY_DATE_TIME)}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
