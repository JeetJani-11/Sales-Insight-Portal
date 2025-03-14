import { useCallback } from "react";
import { cn } from "../../lib/utils";

export default function NodePreviewDraggable({
  icon,
  title,
  description,
  type,
  insertNode,
}) {
  const onDragStart = useCallback(
    (e, type) => {
      e.dataTransfer.setData("application/flow-builder.node-type", type);
      console.log("type", type);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  return (
    <div
      className={cn(
        "flex cursor-grab select-none gap-2 border border-dark-300 rounded-xl bg-dark-400 p-2.5 shadow-sm transition hover:(ring-2 ring-teal-600/50)"
      )}
      
      onDragStart={(e) => onDragStart(e, type)}
      draggable
      data-vaul-no-drag
    >
      <div className="shrink-0">
        <div className="size-8 flex items-center justify-center  rounded-xl bg-dark-300">
          <img src={icon} />
        </div>
      </div>

      <div className="ml-1 flex grow flex-col">
        <div className="mt-px text-sm font-medium leading-normal">{title}</div>

        <div className="line-clamp-3 mt-1 text-xs text-light-50/40 leading-normal">
          {description}
        </div>
      </div>
    </div>
  );
}
