"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MenuItem, iconMap } from "@/constants/menuConfig";
import { useRouterState } from "@/lib/router-state";

export interface MenuProps {
  items: MenuItem[];
  currentPath: string;
  onItemClick?: (href: string) => void;
  variant?: "horizontal" | "vertical" | "mobile";
  role?: string | null;
  showIcons?: boolean;
  className?: string;
  notificationCount?: number;
  countLoading?: boolean;
}

interface MenuItemProps {
  item: MenuItem;
  currentPath: string;
  onItemClick: (href: string) => void;
  variant: "horizontal" | "vertical" | "mobile";
  role?: string | null;
  showIcons?: boolean;
  isActive: (href: string, hasChildren?: boolean) => boolean;
  notificationCount?: number;
  countLoading?: boolean;
  level?: number;
}

function MenuItemComponent({
  item,
  currentPath,
  onItemClick,
  variant,
  role,
  showIcons = true,
  isActive,
  notificationCount = 0,
  countLoading = false,
  level = 0,
}: MenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = iconMap[item.icon] || iconMap["User"];
  const hasChildren = item.children && item.children.length > 0;
  const active = isActive(item.href, hasChildren);

  const baseClasses = {
    horizontal: `relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 z-10 ${
      active ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    }`,
    vertical: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative ${
      active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"
    }`,
    mobile: `w-full px-4 py-2.5 text-left text-sm font-medium rounded-lg flex items-center gap-3 transition-colors relative ${
      active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
    }`,
  };

  const childBaseClasses = {
    vertical: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative ml-6 ${
      active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"
    }`,
    mobile: `w-full px-4 py-2 text-left text-sm font-medium rounded-lg flex items-center gap-3 transition-colors relative ml-6 ${
      active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
    }`,
  };

  const currentBaseClasses = level === 0 ? baseClasses[variant] : (variant === "vertical" || variant === "mobile") ? childBaseClasses[variant] : baseClasses[variant];
  const isNotification = item.id === "notifications";

  const handleClick = (href: string) => {
    if (href !== currentPath) {
      onItemClick(href);
    }
  };

  if (hasChildren && (variant === "vertical" || variant === "mobile")) {
    return (
      <div key={item.id} className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`${currentBaseClasses} w-full`}
        >
          {showIcons && (
            <IconComponent
              className={`h-5 w-5 ${active ? "" : "text-muted-foreground"} group-hover:text-foreground transition-colors flex-shrink-0`}
            />
          )}
          <span className="flex-1 text-left">{item.name}</span>
          {isNotification && (countLoading ? (
            <div className="w-5 h-5 rounded-full bg-muted animate-pulse flex-shrink-0" />
          ) : notificationCount > 0 ? (
            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : (
            <ChevronRight 
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} 
            />
          ))}
          {!isNotification && (
            <ChevronRight 
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} 
            />
          )}
        </button>
        <div className={`transition-all duration-200 overflow-hidden ${isExpanded ? "max-h-96" : "max-h-0"}`}>
          <div className={`space-y-1 ${variant === "mobile" ? "py-1" : ""}`}>
            {item.children!.map((child) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                currentPath={currentPath}
                onItemClick={onItemClick}
                variant={variant}
                role={role}
                showIcons={showIcons}
                isActive={isActive}
                notificationCount={notificationCount}
                countLoading={countLoading}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      key={item.id}
      href={item.href}
      onClick={() => handleClick(item.href)}
      className={currentBaseClasses}
    >
      {(showIcons || variant !== "horizontal") && (
        <IconComponent
          className={`${
            variant === "horizontal" ? "h-4 w-4" : "h-5 w-5"
          } ${active ? "" : "text-muted-foreground"} ${
            variant === "vertical" ? "group-hover:text-foreground transition-colors" : ""
          }`}
        />
      )}
      <span className={variant === "vertical" ? "flex-1" : ""}>{item.name}</span>
      {isNotification && (variant === "vertical" || variant === "mobile") && (
        countLoading ? (
          <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
        ) : notificationCount > 0 ? (
          <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        ) : null
      )}
    </Link>
  );
}

export default function Menu({
  items,
  currentPath,
  onItemClick,
  variant = "horizontal",
  role = null,
  showIcons = true,
  className = "",
  notificationCount = 0,
  countLoading = false,
}: MenuProps) {
  const { startLoading } = useRouterState();

  const filteredItems = items.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });

  const isActive = useCallback((href: string, hasChildren: boolean = false) => {
    if (href === "#" || href === "") return false;
    if (href === "/") {
      return currentPath === "/";
    }
    const exactMatch = currentPath === href;
    if (exactMatch) return true;
    
    if (hasChildren) {
      return false;
    }
    
    const pathParts = currentPath.split("/").filter(Boolean);
    const hrefParts = href.split("/").filter(Boolean);
    
    if (pathParts.length !== hrefParts.length) {
      return false;
    }
    
    return pathParts.every((part, index) => part === hrefParts[index]);
  }, [currentPath]);

  const handleClick = useCallback((href: string) => {
    if (href !== currentPath) {
      startLoading();
    }
    onItemClick?.(href);
  }, [currentPath, startLoading, onItemClick]);

  const containerClasses = {
    horizontal: "hidden md:flex items-center gap-1 relative",
    vertical: "flex-1 p-4 space-y-1 overflow-y-auto",
    mobile: "space-y-1",
  };

  return (
    <nav className={`${containerClasses[variant]} ${className}`}>
      {filteredItems.map((item) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          currentPath={currentPath}
          onItemClick={handleClick}
          variant={variant}
          role={role}
          showIcons={showIcons}
          isActive={isActive}
          notificationCount={notificationCount}
          countLoading={countLoading}
          level={0}
        />
      ))}
    </nav>
  );
}
