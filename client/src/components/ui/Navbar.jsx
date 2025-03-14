import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useSelector } from "react-redux";

export default function NavBar({
  activeTab,
  setActiveTab,
  opportunities,
  currentOpportunity,
  onOpportunityChange,
  opportunity,
  onHomeClick,
}) {
  const account = useSelector((state) => state.account);
  return (
    <div className="flex flex-col md:flex-row items-center px-4 py-2 bg-white h-auto md:h-14 mt-3">
      {/* Logo and Home Click */}
      <div
        className="flex items-center gap-2 cursor-pointer hover:text-gray-500 md:flex-none md:mr-auto mb-2 md:mb-0"
        onClick={onHomeClick}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src="./mavlon-logo.png" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <span className="text-gray-800 text-2xl">Mavlon</span>
      </div>

      {account.exists && opportunity && (
        <div className="flex flex-1 flex-col md:flex-row items-center w-full md:justify-between md:w-auto md:space-x-4 md:m-1">
          {/* Center Tabs */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-6">
            {["Overview", "Strategy", "Relationships"].map((tab) => (
              <a
                key={tab}
                className={`text-sm pb-1 cursor-pointer transition-colors whitespace-nowrap hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r from-gray-400 via-purple-400 to-pink-500 ${
                  activeTab === tab
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 border-b border-gradient-to-r from-purple-400 via-pink-500 to-red-500"
                    : "text-gray-400"
                }`}
                onClick={() => {
                  localStorage.setItem("activeTab", tab);
                  setActiveTab(tab);
                }}
              >
                {tab}
              </a>
            ))}
          </div>

          {/* Tabs Dropdown for Small Screens */}
          <div className="flex md:hidden w-full justify-center mb-4 gap-4">
            <Select
              value={activeTab}
              onValueChange={(value) => {
                localStorage.setItem("activeTab", value);
                setActiveTab(value);
              }}
            >
              <div className="p-[1px] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-md">
                <SelectTrigger className="w-full bg-gray-800 border-none h-8 rounded-md text-white text-sm">
                  <SelectValue placeholder="Select tab" />
                </SelectTrigger>
              </div>
              <SelectContent>
                {["Overview", "Strategy", "Relationships"].map((tab) => (
                  <SelectItem key={tab} value={tab}>
                    {tab}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opportunity Picker */}
          <div className="flex items-center w-full md:w-auto justify-center md:justify-end md:m-1">
            {activeTab === "Overview" ? (
              <Select
                value={currentOpportunity?.ID || ""}
                onValueChange={onOpportunityChange}
              >
                <div className="p-[1px] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-md">
                  <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-none h-8 rounded-md text-white text-sm">
                    <SelectValue placeholder="Select opportunity" />
                  </SelectTrigger>
                </div>
                <SelectContent>
                  {opportunities?.map((opp) => (
                    <SelectItem key={opp.ID} value={opp.ID}>
                      {opp.NAME}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full md:w-[180px] h-8"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
