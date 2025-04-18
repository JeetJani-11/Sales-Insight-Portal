import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { LoaderCircle } from "lucide-react";

export function LatestConversation({ emailMessage, contactInfo }) {
  const [convoSnapShot, setConvoSnapShot] = useState(null);
  async function FetchConversationSummary(emailMessage, contactInfo) {
    const response = await fetch(
      "https://dd93-2405-201-2021-e8d3-5004-e666-24dc-3c3b.ngrok-free.app/contactSummary",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailMessages: emailMessage,
          contact: contactInfo,
        }),
      }
    );
    return await response.json();
  }
  useEffect(() => {
    FetchConversationSummary(emailMessage, contactInfo).then((data) => {
      setConvoSnapShot(data.updates);
    });
  }, []);

  return (
    <Card
      className="w-full rounded-3xl"
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-l text-gray-900">
          Summary of Recent Interaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!convoSnapShot ? (
          <div className="flex items-center justify-center py-4">
            <LoaderCircle className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-gray-600">
            {convoSnapShot}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
