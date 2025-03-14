import { id } from "date-fns/locale";
import { nanoid } from "nanoid";
function createNodeData(type, data) {
  return {
    id: nanoid(),
    type,
    data,
  };
}
const NODES = [
  {
    type: "start",
    defaultData: {
      label: "Start",
      deletable: false,
    },
    detail: {
      icon: "i-mynaui:play",
      title: "Start",
      description: "Start the chatbot flow",
    },
  },
  {
    type: "taskPathNode",
    defaultData: {
      condition: null,
      paths: [
        {
          id: nanoid(),
          case: { id: nanoid(), value: "Competed" },
        },
      ],
    },
    detail: {
      icon: "i-mynaui:git-branch",
      title: "Task Path",
      description: "Perform a task and continue to the next node.",
    },
  },
  {
    type: "end",
    defaultData: {
      label: "End",
      deletable: false,
    },
    detail: {
      icon: "i-mynaui:stop",
      title: "End",
      description: "End the chatbot flow",
    },
  },
  {
    type: "conditionalNode",
    defaultData: {
      condition: null,
      paths: [],
    },
    detail: {
      icon: "i-mynaui:git-branch",
      title: "Conditional Path",
      description:
        "Check a condition and take different paths based on the result.",
    },
  },
];

const AVAILABLE_NODES_ARRAY = [
  {
    type: "taskPathNode",
    defaultData: {
      condition: null,
      paths: [
        {
          id: nanoid(),
          case: { id: nanoid(), value: "Competed" },
        },
      ],
    },
    detail: {
      icon: "./document.svg",
      title: "Task Path",
      description: "Perform a task and continue to the next node.",
    },
  },
  {
    type: "conditionalNode",
    defaultData: {
      condition: null,
      paths: [],
    },
    detail: {
      icon: "./condition.png",
      title: "Conditional Path",
      description:
        "Check a condition and take different paths based on the result.",
    },
  },
];
export function createNodeWithDefaultData(type, data) {
  const defaultData = NODES.find((node) => node.type === type)?.defaultData;
  if (!defaultData)
    throw new Error(`No default data found for node type "${type}"`);
  return Object.assign(createNodeData(type, defaultData), data);
}
const startNode = createNodeWithDefaultData("start", {
  position: { x: 0, y: 100 },
});
const conditionalNode = createNodeWithDefaultData("conditionalNode", {
  position: { x: 300, y: 50 },
});
const endNode = createNodeWithDefaultData("end", {
  position: { x: 900, y: 100 },
});

const nodes = [startNode, conditionalNode, endNode];

const edges = [
  {
    id: nanoid(),
    source: startNode,
    target: conditionalNode,
    type: "deletable",
  }
];

export const AVAILABLE_NODES = AVAILABLE_NODES_ARRAY.filter(
  (node) => node.available === undefined || node.available
).map((node) => ({
  type: node.type,
  icon: node.detail.icon,
  title: node.detail.title,
  description: node.detail.description,
}));
export { nodes as defaultNodes, edges as defaultEdges };
