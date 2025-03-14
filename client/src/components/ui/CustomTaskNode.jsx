import { Position, getConnectedEdges, useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { nanoid } from "nanoid";
import { DeleteIcon, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { NodePath, CustomHandle } from "./NodePath";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { ChevronsUpDownIcon as ChevronUpDown } from "lucide-react";
import { Button } from "./button";

const caseList = [
  { id: nanoid(), value: "Yes" },
  { id: nanoid(), value: "No" },
];

const conditionList = [
  { id: nanoid(), condition: "Create Contact" },
  { id: nanoid(), condition: "Create Account" },
  { id: nanoid(), condition: "Create Opportunity" },
  { id: nanoid(), condition: "Update Contact" },
  { id: nanoid(), condition: "Update Account" },
  { id: nanoid(), condition: "Update Opportunity" },
];

function ConditionDropdownSelector({ value, onChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value ? value.condition : "Select Condition"}
          <ChevronUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {conditionList.map(({ id, condition }) => (
          <DropdownMenuItem
            key={id}
            onSelect={() => onChange({ id, condition })}
          >
            {condition}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function useDeleteNode() {
  const { getNode, getEdges, deleteElements } = useReactFlow();

  return useCallback(
    (id) => {
      const node = getNode(id);
      if (!node) return;

      const edges = getEdges();
      const connectedEdges = getConnectedEdges([node], edges);

      deleteElements({ nodes: [node], edges: connectedEdges }).then();
    },
    [deleteElements, getEdges, getNode]
  );
}

function TaskPathNode({ id, isConnectable, selected, data }) {
  if (!NodePath || !CustomHandle || !DropdownMenu) {
    throw new Error(
      "Missing imports: Ensure all dependencies are correctly imported and exported."
    );
  }
  const meta = {
    icon: "i-mynaui:git-branch",
    title: "Conditional Path",
    description:
      "Check a condition and take different paths based on the result.",
  };

  const [sourceHandleId] = useState(nanoid());

  const { setNodes, setEdges } = useReactFlow();
  const deleteNode = useDeleteNode();

  const onConditionChange = useCallback(
    (value) => {
      setNodes((nodes) =>
        produce(nodes, (draft) => {
          const node = draft.find((n) => n.id === id);
          if (node) {
            node.data = { ...node.data };
            node.data.condition = value;
          }
        })
      );
    },
    [id, setNodes]
  );

  const removeNodePath = useCallback(
    (pathId) => {
      setNodes((nodes) =>
        produce(nodes, (draft) => {
          const node = draft.find((n) => n.id === id);

          if (node) {
            const paths = node.data.paths;
            const pathIndex = paths.findIndex((p) => p.id === pathId);
            paths.splice(pathIndex, 1);
          }
        })
      );

      setEdges((edges) => edges.filter((edge) => edge.sourceHandle !== pathId));
    },
    [id, setEdges, setNodes]
  );

  return (
    <div
      data-selected={selected}
      className="w-xs border border-gray-300 rounded-lg bg-white shadow-md transition divide-y divide-gray-200 data-[selected=true]:(border-blue-500 ring-1 ring-blue-500/50)"
    >
      <div className="relative overflow-clip rounded-t-lg bg-gray-50">
        <div className="absolute inset-0">
          <div className="absolute h-full w-3/5 from-blue-100 to-transparent bg-gradient-to-r" />
        </div>

        <div className="relative h-9 flex items-center justify-between gap-x-4 px-2 py-1">
          <div className="flex grow items-center">
            <div className="size-7 flex items-center justify-center">
              <div className="size-5 flex items-center justify-center rounded-md bg-gray-200">
                <img src="./document.svg" alt="Document" />
              </div>
            </div>

            <div className="ml-2 text-sm font-semibold text-gray-700">
              <span>Task Node</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-x-1">
            <div
              type="button"
              className="size-7 flex items-center justify-center rounded-md bg-transparent hover:cursor-pointer hover:bg-gray-200"
              onClick={() => deleteNode(id)}
            >
              <img src="./delete.png" alt="Delete" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-gray-200">
        <div className="relative min-h-10 flex flex-col">
          <div className="flex flex-col p-4">
            <div className="text-sm text-gray-500 font-medium">
              Condition Attribute
            </div>

            <div className="mt-2 flex">
              <ConditionDropdownSelector
                value={data.condition}
                onChange={onConditionChange}
              />
            </div>
          </div>

          <CustomHandle
            type="target"
            id={sourceHandleId}
            position={Position.Left}
            isConnectable={isConnectable}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 hover:ring-2 hover:ring-purple-500/50 p-1.5"
          />
        </div>

        <div className="flex flex-col p-4">
          

          {data.paths.length > 0 && (
            <div className="mt-2 flex flex-col gap-y-2">
              {data.paths.map((path) => (
                <NodePath
                  key={path.id}
                  id={path.id}
                  path={path.case}
                  onRemove={(_id) => removeNodePath(_id)}
                  isConnectable={isConnectable}
                  isDeletable={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskPathNode;
