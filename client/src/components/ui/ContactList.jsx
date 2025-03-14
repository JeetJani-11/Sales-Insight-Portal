import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "./badge";
import { Phone, Mail, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useSelector } from "react-redux";

export default function ContactList() {
  const account = useSelector((state) => state.account);
  const contacts = account.contacts;
  const navigation = useNavigate();
  let maleIcon = 0;
  let femaleIcon = 0;
  const femaleNames = ["Sarah", "Sophie", "Emily", "Rachel"];

  return (
    <div className="w-full p-4 flex justify-center">
      <div className=" max-w-[1200px] bg-white shadow-md rounded-lg">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[300px] text-gray-700 font-semibold">
                  Name & Title
                </TableHead>
                <TableHead className="w-[250px] text-gray-700 font-semibold">
                  Contact Info
                </TableHead>
                <TableHead className="w-[300px] text-gray-700 font-semibold">
                  Company & Dept
                </TableHead>
                <TableHead className="w-[300px] text-gray-700 font-semibold">
                  Location & Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => {
                let avatar;
                if (femaleNames.includes(contact.FIRST_NAME)) {
                  avatar = `/avatarf${femaleIcon % 2}.jpg`;
                  femaleIcon++;
                } else {
                  avatar = `/avatarm${maleIcon % 3}.jpg`;
                  maleIcon++;
                }

                return (
                  <TableRow
                    key={contact.ID}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-200 hover:cursor-pointer"
                    onClick={() =>
                      navigation("/contact", {
                        state: { contact, account, avatar },
                      })
                    }
                  >
                    <TableCell className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={avatar} />
                          <AvatarFallback>
                            {contact.FIRST_NAME[0]}
                            {contact.LAST_NAME[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900">
                            {contact.FIRST_NAME} {contact.LAST_NAME}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contact.TITLE}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="space-y-1 text-gray-800">
                        {contact.PHONE && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {contact.PHONE}
                          </div>
                        )}
                        {contact.MOBILE_PHONE && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {contact.MOBILE_PHONE}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {contact.EMAIL}
                        </div>
                        {!contact.PHONE &&
                          !contact.MOBILE_PHONE &&
                          !contact.EMAIL && (
                            <div className="text-sm text-gray-500">
                              No contact info
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="space-y-1 text-gray-800">
                        {contact.DEPARTMENT && (
                          <div className="text-sm font-medium">
                            {contact.DEPARTMENT}
                          </div>
                        )}
                        {contact.LEAD_SOURCE && (
                          <div className="text-sm text-gray-600">
                            {contact.LEAD_SOURCE}
                          </div>
                        )}
                        {!contact.DEPARTMENT && !contact.LEAD_SOURCE && (
                          <div className="text-sm text-gray-500">
                            No company info
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="space-y-2 text-gray-800">
                        <div className="flex items-start gap-2 text-sm">
                          {contact.MAILING_CITY &&
                            contact.MAILING_STATE &&
                            contact.MAILING_COUNTRY && (
                              <>
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                <span>
                                  {contact.MAILING_CITY},{" "}
                                  {contact.MAILING_STATE},{" "}
                                  {contact.MAILING_COUNTRY}
                                </span>
                              </>
                            )}
                          {!contact.MAILING_CITY &&
                            !contact.MAILING_STATE &&
                            !contact.MAILING_COUNTRY && (
                              <span className="text-gray-500">
                                No location info
                              </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              contact.CLEAN_STATUS === "Verified"
                                ? "success"
                                : contact.CLEAN_STATUS === "Invalid"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {contact.CLEAN_STATUS}
                          </Badge>
                          {contact.IS_PRIORITY_RECORD && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden">
          {contacts.map((contact) => {
            let avatar;
            if (femaleNames.includes(contact.FIRST_NAME)) {
              avatar = `/avatarf${femaleIcon % 2}.jpg`;
              femaleIcon++;
            } else {
              avatar = `/avatarm${maleIcon % 3}.jpg`;
              maleIcon++;
            }

            return (
              <div
                key={contact.ID}
                className="border border-gray-200 rounded-lg mb-4 p-4 hover:bg-gray-50 transition-colors"
                onClick={() =>
                  navigation("/contact", {
                    state: { contact, account, avatar },
                  })
                }
              >
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>
                      {contact.FIRST_NAME[0]}
                      {contact.LAST_NAME[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-900">
                      {contact.FIRST_NAME} {contact.LAST_NAME}
                    </div>
                    <div className="text-sm text-gray-600">{contact.TITLE}</div>
                  </div>
                </div>
                <div className="text-gray-800 text-sm space-y-2">
                  {contact.PHONE && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {contact.PHONE}
                    </div>
                  )}
                  {contact.MOBILE_PHONE && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {contact.MOBILE_PHONE}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {contact.EMAIL}
                  </div>
                  {contact.MAILING_CITY &&
                    contact.MAILING_STATE &&
                    contact.MAILING_COUNTRY && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {contact.MAILING_CITY}, {contact.MAILING_STATE},{" "}
                        {contact.MAILING_COUNTRY}
                      </div>
                    )}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        contact.CLEAN_STATUS === "Verified"
                          ? "success"
                          : contact.CLEAN_STATUS === "Invalid"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {contact.CLEAN_STATUS}
                    </Badge>
                    {contact.IS_PRIORITY_RECORD && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
