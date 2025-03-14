import { Badge } from "./badge";
import StratergyText from "./StratergyText";
import { useNavigate } from "react-router";
import { LoaderCircleIcon } from "lucide-react";
import { useSelector } from "react-redux";
export default function StratergyPage() {
  const account = useSelector((state) => state.account);
  const valuePropositions = useSelector((state) => state.strategy);
  const OpportunityName = {
    nucor_account_001: [
      "blast furnace for ArcelorMittal",
      "measuring device for steel dynamics",
    ],
    tesla_account_001: [
      "nestle factory expansion",
      "steel material for Milan museum",
    ],
    paris_airport_001: [
      "expansion of Milan airport",
      "steel material for NYC subway",
    ],
  };
  const navigate = useNavigate();
  if (
    !valuePropositions ||
    !account.exists ||
    !valuePropositions.stratergy ||
    !valuePropositions.insights
  )
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex item-center mb-9">
          <LoaderCircleIcon className="text-black animate-spin" />
        </div>
      </div>
    );
  const stratergy = valuePropositions.stratergy;
  let insights = valuePropositions.insights;
  insights = insights.slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex item-center mb-14">
        <p className="text-6xl text-black">Strategy</p>
      </div>
      <p className="text-3xl mb-4">Based on</p>
      {OpportunityName[account.account[0].AccountID] ? (
        <div className="flex flex-wrap gap-2 mb-16">
          {insights.map((insight, index) => (
            <Badge
              key={insight.opportunity.OPPORTUNITY_ID}
              variant="secondary"
              className="bg-black text-white border border-roundedfull border-black text-lg rounded-3xl hover:bg-gray-500 hover:cursor-pointer"
              onClick={() => {
                navigate("/case-study/", { state: insight });
              }}
            >
              {OpportunityName[account.account[0].AccountID][index]
                ? OpportunityName[account.account[0].AccountID][index]
                : insight.opportunity.OPPORTUNITY_NAME}
            </Badge>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-16">
          {insights.map((insight) => (
            <Badge
              key={insight.opportunity.OPPORTUNITY_ID}
              variant="secondary"
              className="bg-black text-white border border-black hover:bg-violet-100 text-xl"
              onClick={() => {
                navigate("/case-study/", { state: insight });
              }}
            >
              {insight.opportunity.OPPORTUNITY_NAME}
            </Badge>
          ))}
        </div>
      )}

      <article className="prose prose-slate lg:prose-lg max-w-none">
        <StratergyText stratergy={stratergy} />
      </article>
    </div>
  );
}
