import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { User } from "@shared/schema";
import { Users as UsersIcon } from "lucide-react";

export default function Users() {
  // Fetch all users
  const { data: users, isLoading } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/users"],
  });

  // User columns for the data table
  const userColumns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (row: User) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: "Username",
      accessorKey: "username",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (row: User) => (
        <Badge variant={row.role === "admin" ? "default" : "outline"}>
          {row.role === "admin" ? "Admin" : "Customer"}
        </Badge>
      ),
    },
    {
      header: "Created At",
      accessorKey: (row: User) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold flex items-center">
            <UsersIcon className="mr-2 h-7 w-7" />
            User Management
          </h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading users...</p>
              </div>
            ) : users && users.length > 0 ? (
              <DataTable
                data={users}
                columns={userColumns}
              />
            ) : (
              <div className="py-16 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">
                  There are no users in the system yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
