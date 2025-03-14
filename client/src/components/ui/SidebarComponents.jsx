import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { cn } from "../../lib/utils";

const defaultOverlayScrollbarsOptions = {
  overflow: {
    x: "hidden",
  },
  scrollbars: {
    autoHide: "move",
    clickScroll: true,
  },
};

export function SidebarPanelWrapper({ children, className, ...props }) {
  return (
    <div className={cn("flex flex-col h-full", className)} {...props}>
      <OverlayScrollbarsComponent
        className="grow"
        defer
        options={defaultOverlayScrollbarsOptions}
      >
        {children}
      </OverlayScrollbarsComponent>
    </div>
  );
}

export function SidebarButtonItem({
  children,
  className,
  active,
  ...props
}) {
  return (
    <button
      type="button"
      className={cn(
        "size-8 flex items-center justify-center rounded-lg border border-transparent outline-none transition",
        [
          active
            ? "border-teal-700 bg-teal-700"
            : "bg-transparent hover:(bg-dark-200) active:(bg-dark-500 border-dark-300)",
        ],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
