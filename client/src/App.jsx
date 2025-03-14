import SearchBar from "./components/ui/Search.jsx";
import Home from "./components/ui/home.jsx";
import NextSteps from "./components/ui/NextSteps.jsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./components/ui/avatar.jsx";
import NeedsAndRisks from "./components/ui/NeedsAndRisks.jsx";
import RecentUpdates from "./components/ui/recentUpdates.jsx";
import RecentActivites from "./components/ui/RecentActivities.jsx";
import { useEffect, useState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import NavBar from "./components/ui/Navbar.jsx";
import ContactList from "./components/ui/ContactList.jsx";
import StrategyPage from "./components/ui/StrategyPage.jsx";
import { ScrollArea } from "./components/ui/scroll-area.jsx";
import { useSelector, useDispatch } from "react-redux";
import { setAccount, unsetAccount } from "./store/account/accountSlice.js";
import {
  setNextSteps,
  unsetNextSteps,
} from "./store/nextSteps/nextStepsSlice.js";
import {
  setNeedsAndRisks,
  unsetNeedsAndRisks,
} from "./store/needsAndRisks/needsAndRisksSlice.js";
import {
  setRecentActivities,
  unsetRecentActivities,
} from "./store/recentActivities/recentActivitiesSlice.js";
import {
  unsetRecentUpdates,
  setRecentUpdates,
} from "./store/recentUpdates/recentUpdatesSlice.js";
import { setStrategy, unsetStrategy } from "./store/strategy/strategySlice.js";
import {
  FetchAccountInfo,
  FetchAccountNextStep,
  FetchNeedsAndRisks,
  FetchRecentUpdates,
  FetchRecentActivities,
  FetchValuePropositions,
} from "./utils/requests.js";

function App() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [accountName, setAccountName] = useState(null);
  const [opportunity, setOpportunity] = useState(null);

  const { account } = useSelector((state) => state);
  const dispatch = useDispatch();
  function onHomeClick() {
    setAccountName(null);
    dispatch(unsetAccount());
    dispatch(unsetNextSteps());
    dispatch(unsetNeedsAndRisks());
    dispatch(unsetRecentUpdates());
    dispatch(unsetRecentActivities());
    dispatch(unsetStrategy());
    localStorage.removeItem("accountName");
    localStorage.removeItem("activeTab");
  }
  useEffect(() => {
    const tab = localStorage.getItem("activeTab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);
  useEffect(() => {
    const accountName = localStorage.getItem("accountName");
    if (accountName) {
      setAccountName(accountName);
    }
  }, []);
  useEffect(() => {
    if (accountName) {
      localStorage.setItem("accountName", accountName);
    }
    if (!accountName) {
      return;
    }
    dispatch(unsetAccount());
    dispatch(unsetNextSteps());
    dispatch(unsetNeedsAndRisks());
    dispatch(unsetRecentUpdates());
    dispatch(unsetRecentActivities());
    dispatch(unsetStrategy());

    FetchAccountInfo(accountName).then((data) => {
      dispatch(setAccount(data));
      if (data.opportunities.length > 0) {
        setOpportunity(data.opportunities[0]);
      }
    });
  }, [accountName]);

  useEffect(() => {
    if (!account.exists || !opportunity) {
      return;
    }
    dispatch(unsetNextSteps());
    dispatch(unsetNeedsAndRisks());
    dispatch(unsetRecentUpdates());
    dispatch(unsetRecentActivities());
    FetchAccountNextStep(
      account.contacts,
      account.emailMessages[opportunity.ID],
      opportunity.ID
    ).then((data) => {
      if (data.next_steps.length > 3) {
        data.next_steps = data.next_steps.slice(0, 3);
      }
      dispatch(setNextSteps(data));
    });
    FetchNeedsAndRisks(
      account.contacts,
      account.emailMessages[opportunity.ID],
      opportunity.ID
    ).then((data) => {
      dispatch(setNeedsAndRisks(data));
    });
    FetchRecentUpdates(account.account[0]).then((data) => {
      if (data.metaData.length > 4) {
        data.metaData = data.metaData.slice(0, 4);
      }
      dispatch(setRecentUpdates(data.metaData));
    });
    FetchRecentActivities(
      accountName,
      account.emailMessages[opportunity.ID],
      account.events,
      opportunity.ID
    ).then((data) => {
      dispatch(setRecentActivities(data.updates));
      FetchValuePropositions(
        accountName,
        account,
        account.opportunities,
        data.updates
      ).then((data) => {
        dispatch(setStrategy(data));
      });
    });
  }, [opportunity]);
  if (!account.exists && accountName === null) {
    return (
      <div className="bg-white text-gray-800 h-screen w-screen overflow-hidden flex flex-col">
        <Home setAccountName={setAccountName} />
      </div>
    );
  }
  if (!account.exists && accountName !== null) {
    return (
      <div
        className="bg-white text-black min-h-screen flex flex-col justify-center items-center"
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        <LoaderCircleIcon className="text-gray-400 animate-spin" />
      </div>
    );
  }
  const onOpportunityChange = (value) => {
    setOpportunity(account.opportunities.find((opp) => opp.ID === value));
  };
  if (account.opportunities.length === 0) {
    return (
      <div
        className="bg-white text-black min-h-screen flex flex-col justify-center items-center"
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        <h1 className="text-3xl  mb-4">No open opportunities found</h1>
        <SearchBar setAccountName={setAccountName} />
      </div>
    );
  }
  return (
    <div className="bg-white text-gray-800 h-screen w-screen overflow-hidden flex flex-col">
      {/* Top Navigation */}
      {account.exists && opportunity && (
        <NavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          opportunities={account.opportunities}
          currentOpportunity={opportunity}
          onOpportunityChange={onOpportunityChange}
          opportunity={opportunity}
          onHomeClick={onHomeClick}
        />
      )}

      {/* Main Content */}
      <ScrollArea className="rounded-md p-4">
        <div className="flex-grow overflow-auto">
          {activeTab === "Overview" && (
            <div className="flex justify-center py-8">
              <div className="max-w-6xl w-full px-4">
                {/* Account Info Header */}
                <div className="flex flex-wrap items-end gap-6 mb-16">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={`https://cdn.brandfetch.io/${account.account[0].Website}?c=1idaroPYX6MwOp6glye`}
                    />
                    <AvatarFallback>
                      {account.account[0].Name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <span className="text-6xl text-black">
                      {account.account[0].Name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end sm:items-start">
                    <h2 className="text-lg font-medium text-black">
                      {account.owner[0].NAME}
                    </h2>
                    <p className="text-gray-600 text-sm break-words">
                      {account.owner[0].EMAIL}
                    </p>
                  </div>
                </div>

                {/* Widgets */}
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <RecentUpdates />
                  <RecentActivites />
                  <NextSteps />
                  <NeedsAndRisks />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Strategy" && (
            <div className="flex justify-center py-8">
              <div className="max-w-6xl w-full px-4">
                <StrategyPage />
              </div>
            </div>
          )}

          {activeTab === "Relationships" && (
            <div className="flex justify-center py-8">
              <div className="max-w-6xl w-full px-4">
                <ContactList />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default App;
