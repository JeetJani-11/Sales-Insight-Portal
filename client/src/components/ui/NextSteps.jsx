import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { LoaderCircle } from "lucide-react";
import { useSelector } from "react-redux";
export default function NextSteps() {
  const nextSteps = useSelector((state) => state.nextSteps);
  return (
    <div className="lg:col-span-2">
      <Card className="bg-white rounded-3xl" style={{ height: "100%" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-black">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-400 to-orange-400" />
            Next Steps
          </CardTitle>
        </CardHeader>
        {nextSteps ? (
          nextSteps.error ? (
            <CardContent className="text-center text-black">
              No Next Steps Available
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">{nextSteps.summary}</p>

              <div className="space-y-2">
                <span className="text-lg font-medium text-black">Action Items</span>
                <ul className="space-y-2 text-sm text-gray-500">
                  {nextSteps.next_steps.map((item, index) => (
                    <li className="flex items-center gap-2" key={index}>
                      <div
                        className="h-1 w-1 rounded-full bg-pink-400"
                        style={{
                          minWidth: "0.25rem",
                          minHeight: "0.25rem",
                        }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )
        ) : (
          <CardContent className="flex items-center justify-center h-32">
            <LoaderCircle className="text-black animate-spin" />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
