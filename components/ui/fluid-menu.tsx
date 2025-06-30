"use client";

import React, {
  useState,
  isValidElement,
  cloneElement,
  ReactElement,
  ReactNode,
  Children,
} from "react";
import { ChevronDown } from "lucide-react";

interface MenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  showChevron?: boolean;
}

export function Menu({
  trigger,
  children,
  align = "left",
  showChevron = true,
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex items-center"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        {showChevron && (
          <ChevronDown
            className="ml-2 -mr-1 h-4 w-4 text-black"
            aria-hidden="true"
          />
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"
            } mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">{children}</div>
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  isActive?: boolean;
  title?: string;
  [key: string]: any;
}

export function MenuItem({
  children,
  onClick,
  disabled = false,
  icon,
  isActive = false,
  title,
  ...props
}: MenuItemProps) {
  return (
    <button
      title={title}
      className={`relative block w-full h-16 text-center group
        ${disabled ? "text-gray-400 cursor-not-allowed" : "text-black"}
        ${isActive ? "bg-white/10" : ""}`}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <span className="flex items-center justify-center h-full">
        {icon && (
          <span className="h-6 w-6 transition-all duration-200 group-hover:[&_svg]:stroke-[2] text-black">
            {icon}
          </span>
        )}
        {children}
      </span>
    </button>
  );
}

// Type guard to check child is ReactElement with props
function isReactElementWithProps(
  child: ReactNode
): child is ReactElement<{ title?: string }> {
  return isValidElement(child) && typeof child.props === "object";
}

export function MenuContainer({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childrenArray = Children.toArray(children);

  const handleToggle = () => setIsExpanded((prev) => !prev);

  return (
    <div className="relative w-[64px]" data-expanded={isExpanded}>
      <div className="relative">
        {/* Always-visible trigger */}
        <div
          className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 cursor-pointer rounded-full flex items-center justify-center group will-change-transform z-50"
          onClick={handleToggle}
        >
          {childrenArray[0]}
        </div>

        {/* Expandable items with tooltip */}
        {childrenArray.slice(1).map((child, index) => {
          if (!isValidElement(child)) return null;

          const title = (child.props as any)?.title || `Item ${index + 1}`;
          const cloned = isReactElementWithProps(child)
            ? cloneElement(child, { ...child.props })
            : null;

          return (
            <div
              key={index}
              title={title} // ✅ Put the title here (the hovered container)
              className={`
        absolute top-0 left-0 w-16 h-16 
        bg-gray-100 dark:bg-gray-800 
        flex items-center justify-center 
        text-gray-400 hover:text-black focus:text-black
        transition-colors duration-200
        will-change-transform
      `}
              style={{
                transform: `translateY(${isExpanded ? (index + 1) * 48 : 0}px)`,
                opacity: isExpanded ? 1 : 0,
                zIndex: 40 - index,
                clipPath:
                  index === childrenArray.length - 2
                    ? "circle(50% at 50% 50%)"
                    : "circle(50% at 50% 55%)",
                transition: `transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
                     opacity 350ms`,
              }}
            >
              {cloned}
            </div>
          );
        })}

      </div>
    </div>
  );
}
