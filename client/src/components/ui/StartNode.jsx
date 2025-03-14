import { Position } from "@xyflow/react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { cn } from "../../lib/utils";
import CustomHandle from "./CustomHandle";

export function StartNode({ data, selected, isConnectable }) {
  const meta = {
    icon: "i-mynaui:play",
    title: "Start",
    description: "Start the chatbot flow",
  };

  const [sourceHandleId] = useState(nanoid());
  return (
    <>
      <div
        data-selected={selected}
        className="flex items-center border border-dark-100 rounded-full bg-dark-300 px-4 py-2 shadow-sm transition data-[selected=true]:(border-teal-600 ring-1 ring-teal-600/50)"
      >
        <div className={cn(meta.icon, "size-4.5 shrink-0 mr-2 scale-130")} />

        <span className="mr-1">{data.label || meta.title}</span>
      </div>
      <CustomHandle
        type="source"
        id={sourceHandleId}
        position={Position.Right}
        isConnectable={isConnectable}
        className="absolute top-1/2 right-0 transform -translate-y-1/2 hover:ring-2 hover:ring-purple-500/50 p-1.5"
      />
    </>
  );
}
