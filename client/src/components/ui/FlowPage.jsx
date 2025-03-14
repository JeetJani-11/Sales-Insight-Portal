import { ReactFlowProvider } from "@xyflow/react";

import Flow from "./Flow";

export default function FlowPage() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
