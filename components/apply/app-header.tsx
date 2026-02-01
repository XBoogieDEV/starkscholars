"use client";

import Link from "next/link";
// import { User } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";

interface AppHeaderProps {
  user: {
    _id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/apply/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-amber-600">
            William R. Stark
          </span>
          <span className="text-sm text-gray-600 hidden sm:inline">
            Financial Assistance
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/apply/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/apply/step/1"
            className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
          >
            Application
          </Link>
          <Link
            href="/apply/status"
            className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
          >
            Status
          </Link>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-amber-100 text-amber-800 text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {user.name && (
                  <p className="font-medium">{user.name}</p>
                )}
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/apply/dashboard" className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => {
                // TODO: Implement sign out
                window.location.href = "/api/auth/signout";
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
