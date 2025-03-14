import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { LoaderCircleIcon } from "lucide-react";
import CRMAnalyticsCard from "./ValuePropositionCard";
export default function Stratergy({ valuePropositions }) {
  return (
    <div className="lg:col-span-2">
      {valuePropositions ? (
        valuePropositions.error ? (
          <CardContent className="text-center text-gray-400">
            No Next Steps Available
          </CardContent>
        ) : (
          <CRMAnalyticsCard data={valuePropositions} />
        )
      ) : (
        <Card
          className="bg-gray-800 border border-gray-700 rounded-lg"
          style={{ height: "100%" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-100">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400" />
              Value Propositions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            <LoaderCircleIcon className="text-gray-400 animate-spin" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
