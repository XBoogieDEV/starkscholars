"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, UserCog } from "lucide-react";

export default function CommitteePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Committee Members</h2>
          <p className="text-muted-foreground">
            Manage scholarship committee members and their permissions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-8">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <UserCog className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Committee Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add, remove, and manage committee member access
              </p>
              <Button variant="outline">Coming Soon</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-8">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">User Accounts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View and manage all user accounts in the system
              </p>
              <Button variant="outline">Coming Soon</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
