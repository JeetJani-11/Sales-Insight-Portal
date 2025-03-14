import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "./badge";
const CRMAnalyticsCard = ({ data }) => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white">
      <header className="flex items-center gap-2 mb-4">
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"></span>
        <h2 className="text-lg font-medium">Value Propositions</h2>
      </header>

      <div className="mb-6">
        <p className="w-full">
          {showMore
            ? data.valueProposition
            : `${data.valueProposition.slice(0, 100)}...`}
        </p>
        <button
          className="mt-2 text-sm text-blue-400 hover:underline"
          onClick={toggleShowMore}
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
      </div>

      {/* Similar Deals Section */}
      <section className="space-y-4">
        {data.insights.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-lg border-l-4 border-b-4 border-purple-400"
            onClick={() => {
              navigate("/case-study", { state: { item } });
            }}
          >
            <ul className="ml-5 space-y-1 text-sm text-gray-400">
              <li>{item.opportunity.NAME}</li>

              <li>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-700/20 text-purple-400 border-purple-600"
                  >
                    ${item.opportunity.AMOUNT.toLocaleString()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-blue-700/20 text-blue-400 border-blue-600"
                  >
                    {item.opportunity.INDUSTRY}
                  </Badge>
                </div>
              </li>
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
};

export default CRMAnalyticsCard;
