import { Position } from "@xyflow/react";
import { nanoid } from "nanoid";
import { useState } from "react";

import CustomHandle from "./CustomHandle";
import { cn } from "../../lib/utils";
import { tr } from "date-fns/locale";

export function EndNode({ data, selected }) {
  const meta = {
    icon: "i-mynaui:stop",
    title: "End",
    description: "End the chatbot flow",
  };

  const [sourceHandleId] = useState(nanoid());

  return (
    <>
      <div
        data-selected={selected}
        data-deletable={false}
        className="flex items-center border border-dark-100 rounded-full bg-dark-300 px-4 py-2 shadow-sm transition data-[selected=true]:(border-teal-600 ring-1 ring-teal-600/50)"
      >
        <div className={cn(meta.icon, "size-4.5 shrink-0 mr-2 scale-130")} />

        <span className="mr-1">{data.label || meta.title}</span>
      </div>

      <CustomHandle
        type="target"
        id={sourceHandleId}
        position={Position.Left}
        isConnectable={true}
        maxconnections={10}
        isValidConnection={() => true}
        className="absolute top-1/2 right-0 transform -translate-y-1/2 hover:ring-2 hover:ring-purple-500/50 p-1.5"
      />
    </>
  );
}
