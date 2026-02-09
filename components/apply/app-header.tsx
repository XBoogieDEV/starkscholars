"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogOut, User as UserIcon, Menu, X, LayoutDashboard, FileText, Activity } from "lucide-react";

interface AppHeaderProps {
  user: {
    _id: string;
    email: string;
    name?: string;
    role: string;
  };
}

const navItems = [
  { name: "Dashboard", href: "/apply/dashboard", icon: LayoutDashboard },
  { name: "Application", href: "/apply/step/1", icon: FileText },
  { name: "Status", href: "/apply/status", icon: Activity },
];

export function AppHeader({ user }: AppHeaderProps) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user.email[0].toUpperCase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 touch-manipulation"
                aria-label="Open menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={shouldReduceMotion ? {} : { rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={shouldReduceMotion ? {} : { rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={shouldReduceMotion ? {} : { rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={shouldReduceMotion ? {} : { rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border">
                  <Link
                    href="/apply/dashboard"
                    className="flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg font-bold font-serif text-foreground">
                      Stark Scholars
                    </span>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    Financial Assistance Program
                  </p>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.name}
                        initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors min-h-[44px]"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground/70" />
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-border">
                  <button
                    onClick={() => {
                      window.location.href = "/signout";
                    }}
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full min-h-[44px]"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/apply/dashboard" className="flex items-center gap-2">
            <span className="text-base sm:text-xl font-bold font-serif text-foreground truncate max-w-[140px] sm:max-w-none">
              Stark Scholars
            </span>
            <span className="text-xs sm:text-sm text-primary hidden sm:inline">
              Financial Assistance
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right: User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0"
            >
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none min-w-0">
                {user.name && (
                  <p className="font-medium text-sm truncate">{user.name}</p>
                )}
                <p className="w-full truncate text-xs sm:text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/apply/dashboard" className="cursor-pointer text-sm">
                <UserIcon className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 text-sm"
              onClick={() => {
                window.location.href = "/signout";
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
