import * as React from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        {...props}
        className={`flex w-full max-w-[300px] h-[40px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm placeholder-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-300/50 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
        style={{
          borderRadius: "6px", // ✅ Forces rounded borders
          height: "40px", // ✅ Consistent height across inputs
          borderColor: "#d1d5db", // ✅ Matches Tailwind's `border-gray-300`
          backgroundColor: "white", // ✅ Prevents unwanted styling overrides
        }}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
