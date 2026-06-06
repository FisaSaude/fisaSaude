import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-11 w-full min-w-0 min-h-[44px] rounded-lg border-2 px-4 py-2.5 text-base bg-input-background transition-all outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        "focus:border-ring focus:ring-4 focus:ring-ring/30 focus:outline-2 focus:outline-offset-2 focus:outline-ring",
        "hover:border-ring/50",
        "aria-invalid:ring-destructive/30 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/30",
        "read-only:bg-muted read-only:cursor-default read-only:border-muted-foreground/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
