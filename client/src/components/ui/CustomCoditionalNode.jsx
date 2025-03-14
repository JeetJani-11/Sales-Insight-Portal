import { Position, getConnectedEdges, useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { nanoid } from "nanoid";
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
import { Plus } from "lucide-react";

const caseList = [
  { id: nanoid(), value: "Yes" },
  { id: nanoid(), value: "No" },
];

const conditionList = [
  { id: nanoid(), condition: "If Contact exists ?" },
  { id: nanoid(), condition: "If Account exists ?" },
  { id: nanoid(), condition: "If Opportunity exists ?" },
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

export function ConditionalPathNode({ id, isConnectable, selected, data }) {
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
          if (node) node.data.condition = value;
        })
      );
    },
    [id, setNodes]
  );

  const filteredCaseList = useMemo(() => {
    return caseList.filter(
      (c) => !data.paths.some((p) => p.case.value === c.value)
    );
  }, [data.paths]);

  const addNodePath = useCallback(
    (path) => {
      setNodes((nodes) =>
        produce(nodes, (draft) => {
          const node = draft.find((n) => n.id === id);

          if (node) {
            node.data.paths.push({
              id: nanoid(),
              case: path,
            });
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
      className="w-xs border border-gray-300 rounded-lg bg-white shadow-lg transition divide-y divide-gray-200 "
    >
      <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-purple-50 to-transparent">
        <div className="relative h-10 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2 gap-1.5">
            <div className="h-6 w-6 flex items-center justify-center rounded-md">
              <img src="./condition.png" alt="Condition" />
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {meta.title}
            </div>
            <div className="flex shrink-0 items-center">
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
      </div>

      <div className="flex flex-col divide-y divide-gray-200">
        <div className="relative min-h-12 p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase">
            Condition Attribute
          </div>
          <div className="mt-3">
            <ConditionDropdownSelector
              value={data.condition}
              onChange={onConditionChange}
            />
          </div>
          <CustomHandle
            type="target"
            id={sourceHandleId}
            position={Position.Left}
            isConnectable={isConnectable}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 hover:ring-2 hover:ring-purple-500/50 p-1.5"
          />
        </div>

        <div className="p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase">
            Paths to Follow
          </div>

          {data.paths.length > 0 && (
            <div className="mt-3 space-y-2">
              {data.paths.map((path) => (
                <NodePath
                  key={path.id}
                  id={path.id}
                  path={path.case}
                  onRemove={(_id) => removeNodePath(_id)}
                  isConnectable={isConnectable}
                  isDeletable={true}
                />
              ))}
            </div>
          )}

          {filteredCaseList.length > 0 && (
            <div className="mt-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Add Path
                    </span>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white shadow-md rounded-md">
                  {filteredCaseList.map((path) => (
                    <DropdownMenuItem
                      key={path.id}
                      onSelect={() =>
                        addNodePath({ id: path.id, value: path.value })
                      }
                    >
                      <span className="text-sm text-gray-700">
                        {path.value}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
