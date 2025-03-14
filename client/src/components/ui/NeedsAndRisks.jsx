import { Card, CardContent, CardHeader, CardTitle } from "./card";
import ProgressBar from "./progressBar";
import { LoaderCircleIcon } from "lucide-react";
import { useSelector } from "react-redux";
export default function NeedsAndRisks() {
  const needsAndRisks = useSelector((state) => state.needsAndRisks);
  return (
    <>
      <div className="lg:col-span-2">
        <Card className="bg-white rounded-3xl" style={{ height: "100%" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-black">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-400 to-pink-400" />
              Needs
            </CardTitle>
          </CardHeader>
          {needsAndRisks ? (
            needsAndRisks.error ? (
              <CardContent className="text-center text-black">
                Unable to fetch needs and risks data. Please try again later.
              </CardContent>
            ) : (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-3">
                      {needsAndRisks.overallNeeds}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <ul className="space-y-2 text-sm text-black">
                      {needsAndRisks.needsDetail.map((item, index) => (
                        <li className="flex items-center gap-2" key={index}>
                          <ProgressBar
                            label={item.name}
                            value={parseInt(item.fulfiled)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            )
          ) : (
            <CardContent className="flex items-center justify-center h-32">
              <LoaderCircleIcon className="text-black animate-spin" />
            </CardContent>
          )}
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="bg-white rounded-3xl" style={{ height: "100%" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-black">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-400 to-pink-400" />
              Risks
            </CardTitle>
          </CardHeader>
          {needsAndRisks ? (
            needsAndRisks.error ? (
              <CardContent className="text-center text-black">
                Unable to fetch risk data. Please try again later.
              </CardContent>
            ) : (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-500 mt-3 mb-3">
                      {needsAndRisks.overallRisks}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <ul className="space-y-2 text-sm">
                      {needsAndRisks.riskDetail.map((item, index) => (
                        <li className="flex items-center gap-2" key={index}>
                          <ProgressBar
                            label={item.name}
                            value={parseInt(item.riskParam)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            )
          ) : (
            <CardContent className="flex items-center justify-center h-32">
              <LoaderCircleIcon className="text-black animate-spin" />
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
