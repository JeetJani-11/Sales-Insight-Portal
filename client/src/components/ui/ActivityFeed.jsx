"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { subDays } from "date-fns";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
import DatePickerWithRange from "./DateRangePicker";

export function ActivityFeed({ activities, contact }) {
  const [dateRange, setDateRange] = React.useState([
    subDays(new Date(), 90),
    new Date(),
  ]);
  if (
    !dateRange ||
    !dateRange[0] ||
    !dateRange[1] ||
    dateRange[0] == "Invalid Date" ||
    dateRange[1] == "Invalid Date"
  )
    return (
      <div
        className="bg-white rounded-3xl border p-4 space-y-4 shadow-md"
        style={{
          height: "100%",
        }}
      >
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-sm font-medium text-gray-700">Latest Activity</h2>
        </div>
        <DatePickerWithRange
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <p className="text-sm text-gray-600">Please select date range</p>
      </div>
    );
  const filteredActivities = activities.filter((activity) => {
    console.log("Activity", activity);
    if (
      (new Date(activity.ACTIVITY_DATE_TIME) <= dateRange[1] &&
        new Date(activity.ACTIVITY_DATE_TIME) >= dateRange[0]) ||
      (new Date(activity.MessageDate) <= dateRange[1] &&
        new Date(activity.MessageDate) >= dateRange[0])
    ) {
      return true;
    }
    return false;
  });

  return (
    <div
      className="bg-white rounded-3xl border p-4 space-y-4 shadow-md"
      style={{
        height: "100%",
      }}
    >
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-sm font-medium text-gray-700">Latest Activity</h2>
      </div>
      <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
      <ScrollArea className="h-[200px] pr-4">
        <div className="relative pr-4">
          <div className="absolute left-[24px] top-0 bottom-0 w-[2px] bg-gray-200" />
          <ul className="space-y-4 relative">
            {filteredActivities.length === 0 && (
              <p className="text-sm text-gray-600">No activities found</p>
            )}
            {filteredActivities.map((activity, index) => (
              <li key={index} className="pl-8 relative">
                <div
                  className={`absolute left-[13px] top-[calc(50%-12px)] h-[24px] w-[24px] rounded-full border-4 border-white shadow-md ${
                    activity.MessageIdentifier
                      ? activity.FromAddress === contact.EMAIL
                        ? "bg-blue-500"
                        : "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                />

                {activity.MessageIdentifier ? (
                  <>
                    {activity.FromAddress === contact.EMAIL ? (
                      <div className="p-2 rounded ml-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">
                            {contact.FIRST_NAME} {contact.LAST_NAME}
                          </span>{" "}
                          sent an email to{" "}
                          <span
                            key={`${activity.MessageIdentifier}-${index}`}
                            className="text-blue-600"
                          >
                            Suchita Jain
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 rounded ml-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Suchita Jain</span> sent
                          an email to{" "}
                          <span
                            key={`${activity.MessageIdentifier}-${index}`}
                            className="text-green-600"
                          >
                            {contact.FIRST_NAME} {contact.LAST_NAME}
                          </span>
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-2 rounded ml-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Suchita Jain</span> had a
                      meeting with{" "}
                      <span className="text-yellow-600">
                        {contact.FIRST_NAME} {contact.LAST_NAME}
                      </span>
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </div>
  );
}
