import { Card, CardContent, CardHeader, CardTitle } from "./card";
import LinkPreview from "./LinkPreview";
import { LoaderCircleIcon } from "lucide-react";
import { useSelector } from "react-redux";

export default function RecentUpdates() {
  const recentUpdates = useSelector((state) => state.recentUpdates);
  return (
    <div className="lg:col-span-3">
      <Card className="bg-white rounded-3xl" style={{ height: "100%" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-black">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-400 to-orange-400" />
            What&apos;s New
          </CardTitle>
        </CardHeader>
        {recentUpdates ? (
          recentUpdates.error ? (
            <CardContent className="space-y-4">
              <p className="text-black text-sm italic">
                No Recent Updates Available
              </p>
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-black">
                {recentUpdates.map((item, index) => (
                  <li className="flex items-center gap-2" key={index}>
                    <LinkPreview metadata={item} />
                  </li>
                ))}
              </ul>

              {recentUpdates.length == 0 && (
                <p className="text-black text-sm italic">
                  No recent updates available
                </p>
              )}
            </CardContent>
          )
        ) : (
          <CardContent className="flex items-center justify-center h-32">
            <LoaderCircleIcon className="text-black animate-spin" />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
