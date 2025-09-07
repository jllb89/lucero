"use client"

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
  className?: string;
  children?: React.ReactNode;
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className = "", children, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Black/white/gray color scheme
  "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-1 border-gray-100 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 "+
  "data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Thumb is white when checked, gray when unchecked
  "pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform duration-200 ease-in-out data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 "+
  "data-[state=checked]:bg-white data-[state=unchecked]:bg-white"
      )}
    />
    {children}
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
