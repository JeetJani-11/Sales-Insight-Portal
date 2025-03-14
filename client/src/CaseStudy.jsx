import OpportunityOverview from "./components/ui/OpportunityOverview";
import { useLocation } from "react-router-dom";
export default function CaseStudy() {
  const { state } = useLocation();
  console.log(state);
  return (
    <div
      style={{
        height: "100%",
        width: "100vw",
        minHeight: "100vh",
      }}
      className="flex flex-col items-center justify-center bg-white text-black p-6"
    >
      <OpportunityOverview
        opportunity={state.opportunity}
        overview={state.overview}
      />
    </div>
  );
}
