import { Position } from "@xyflow/react";
import { Handle, getConnectedEdges, useNodeId, useStore } from "@xyflow/react";
import { is } from "date-fns/locale";
import { useMemo } from "react";

export function CustomHandle({ className, isConnectable, ...props }) {
  const { nodeLookup, edges } = useStore(({ nodeLookup, edges }) => ({
    nodeLookup,
    edges,
  }));
  const nodeId = useNodeId();

  const isHandleConnectable = useMemo(() => {
    if (!nodeId) return false;

    const node = nodeLookup.get(nodeId);
    if (!node) return false;

    const connectedEdges = getConnectedEdges([node], edges);

    if (typeof isConnectable === "function") {
      return isConnectable({ node, connectedEdges });
    }

    if (typeof isConnectable === "number") {
      return connectedEdges.length < isConnectable;
    }

    return isConnectable;
  }, [edges, isConnectable, nodeId, nodeLookup]);

  return (
    <Handle
      className={`hover:ring-2 hover:ring-teal-500/50 border border-black bg-gray-400 shadow-sm transition ${className}`}
      isConnectable={isHandleConnectable}
      {...props}
    />
  );
}

export function NodePath({ id, onRemove, isConnectable, path, isDeletable }) {
  return (
    <div className="relative flex items-center gap-2 px-4 bg-white rounded shadow-sm -mx-4">
      {isDeletable && (
        <div
          type="button"
          className="h-8 w-8 flex items-center justify-center rounded text-red-500 transition hover:bg-gray-100 active:border-gray-400 active:bg-gray-200"
          onClick={() => onRemove(id)}
        >
          <img src="./delete.png" alt="Delete" className="h-8 w-8" />
        </div>
      )}

      <input
        type="text"
        value={path.value}
        readOnly
        className="h-8 flex-1 border border-gray-300 rounded bg-gray-100 px-2 text-sm font-medium shadow-sm transition hover:bg-gray-200 read-only:hover:bg-gray-100"
      />

      <CustomHandle
        type="source"
        id={id}
        position={Position.Right}
        isConnectable={isConnectable}
        className="absolute top-1/2 right-0 transform -translate-y-1/2 hover:ring-2 hover:ring-purple-500/50 p-1.5"
      />
    </div>
  );
}
