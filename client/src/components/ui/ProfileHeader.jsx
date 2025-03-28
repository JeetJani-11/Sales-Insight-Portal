import { Avatar, AvatarFallback, AvatarImage } from "./avatar.jsx";
import { Mail } from "lucide-react";

export function ProfileHeader({ contactInfo, account, avatar }) {
  let departmentSet = new Set();
  account.contacts.forEach((contact) => {
    departmentSet.add(contact.DEPARTMENT);
  });

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-start justify-end sm:justify-between p-6 bg-white border-b">
      <div className="flex flex-col sm:flex-row sm:gap-4 items-end sm:items-center text-right sm:text-left">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`${avatar}`} />
          <AvatarFallback>
            {contactInfo.FIRST_NAME[0] + contactInfo.LAST_NAME[0]}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-bold">
            {contactInfo.FIRST_NAME + " " + contactInfo.LAST_NAME}
          </h1>
          <p className="text-sm text-gray-500">{contactInfo.DEPARTMENT}</p>
          <div className="flex items-center gap-2 justify-end sm:justify-start text-sm text-gray-500">
            <span>{account.account.Name}</span>
            <Mail className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-0 text-right sm:text-left">
        <div className="text-xl md:text-2xl font-semibold">
          {account.contacts.length}
        </div>
        <div className="text-sm text-gray-500">Connected colleagues</div>
        <div className="text-xs text-gray-400">
          Across {departmentSet.size} departments
        </div>
      </div>
    </div>
  );
}
