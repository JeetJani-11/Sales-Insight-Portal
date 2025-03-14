import {
  BezierEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from "@xyflow/react";

export default function CustomDeletableEdge(props) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = props;

  const { setEdges } = useReactFlow();

  const [_, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BezierEdge {...props} />
      <EdgeLabelRenderer>
        <div
        
          className="group pointer-events-auto absolute size-5 flex items-center justify-center rounded-full bg-white text-red-300 transition-colors transition-shadow hover:cursor-pointer hover:bg-red-100 hover:text-red-500 shadow-sm border border-red-300"
          style={{
            transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
          }}
          onClick={() =>
            setEdges((edges) => edges.filter((edge) => edge.id !== id))
          }
        >
         <img src="./cross.png" alt="Delete" />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
