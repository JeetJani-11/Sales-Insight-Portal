import { cn } from "../../lib/utils";

export default function CustomControlButton({ children, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "border-none flex disabled:(pointer-events-none op-30 cursor-not-allowed) items-center justify-center bg-transparent size-7 text-light-50 rounded-md transition active:(bg-dark-200) hover:(bg-dark-300)",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
