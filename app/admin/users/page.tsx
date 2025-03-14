"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react"; // Icons

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  phoneNumber: string;
  address?: string;
  createdAt: string;
}

interface ApiResponse {
  users: User[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`/api/admin/users?page=${page}&perPage=10`);
        const data: ApiResponse = await res.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUsers();
  }, [page]);

  // 🔥 Filter users based on search input
  const filteredUsers = useMemo(
    () =>
      users?.length
        ? users.filter(
            (user) =>
              user.name?.toLowerCase().includes(search.toLowerCase()) ||
              user.email.toLowerCase().includes(search.toLowerCase())
          )
        : [],
    [search, users]
  );

  return (
    <div className="p-6 bg-neutral-100 min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-gray-500 text-sm mb-4">
        <Link href="/admin" className="hover:underline">
          Lucero Admin Dashboard
        </Link>{" "}
        / Users
      </nav>

      {/* Users Table */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-xl font-regular text-black mb-4">Users</h2>

        <Table className="bg-white border-none rounded-xl overflow-hidden">
          <TableHeader>
            {/* Search & Add User Row */}
            <TableRow className="border-b border-gray-200">
              <TableCell colSpan={6} className="p-3">
                <div className="flex items-center justify-between space-x-4">
                  {/* Search Input */}
                  <div className="relative w-1/3">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Search by name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-10 w-full py-2 border border-gray-300 rounded-lg"
                    />
                    {search && (
                      <X
                        className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                        size={18}
                        onClick={() => setSearch("")}
                      />
                    )}
                  </div>

                  {/* Add User Button */}
                  <Button className="bg-black text-white px-4 py-2 !rounded-md hover:bg-gray-800">
  + Add User
</Button>

                </div>
              </TableCell>
            </TableRow>

            {/* Table Headers */}
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className={selectedUser?.id === user.id ? "bg-gray-200" : ""}
                  onClick={() => setSelectedUser(user)}
                >
                  <TableCell>{user.name || "—"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.address || "—"}</TableCell>
                  <TableCell>
                    <Badge className="bg-black text-white">
                      {user.role === "USER" ? "User" : user.role === "ADMIN" ? "Admin" : "Super Admin"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Selected User Actions */}
        {selectedUser && (
          <div className="flex justify-end mt-4 space-x-4">
            <Button
              className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800"
              onClick={() => console.log("Edit user", selectedUser.id)}
            >
              Edit User
            </Button>
            <Button
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
              onClick={() => console.log("Delete user", selectedUser.id)}
            >
              Delete User
            </Button>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          {page > 1 && (
            <button
              className="text-black underline cursor-pointer"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              ← Previous
            </button>
          )}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <button
              className="text-black underline cursor-pointer"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
