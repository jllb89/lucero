"use client";

import { useEffect, useState, useMemo, useId } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

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
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const id = useId();
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`/api/admin/users?page=${page}&perPage=${perPage}`);
        const data: ApiResponse = await res.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUsers();
  }, [page, perPage]);

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

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const updated = new Set(prev);
      updated.has(userId) ? updated.delete(userId) : updated.add(userId);
      return updated;
    });
  };

  const roleMap: Record<string, string> = {
    USER: "User",
    ADMIN: "Admin",
    SUPER_ADMIN: "Super Admin",
  };

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
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              <TableCell colSpan={6} className="p-3 pb-5">
                <div className="flex items-center justify-between space-x-4">
                  {/* Search Input */}
                  <div className="relative w-1/3">
                    <Label htmlFor={id} className="sr-only">
                      Search
                    </Label>
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 text-muted-foreground/80 peer-disabled:opacity-50" size={18} />
                      <Input
                        id={id}
                        type="text"
                        placeholder="  Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ borderRadius: "6px" }}
                        className="peer w-full pe-9 pl-10 border border-gray-300"
                      />
                      {search && (
                        <X
                          className="absolute right-3 text-muted-foreground/80 cursor-pointer"
                          size={18}
                          onClick={() => setSearch("")}
                        />
                      )}
                    </div>
                  </div>

                  {/* Add User Button */}
                  <Button style={{ borderRadius: "6px" }} className="bg-black text-white px-4 py-2 hover:bg-black" onClick={() => router.push("/admin/users/add")}
                  >
                    + Add User
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            {/* Table Headers */}
            <TableRow>
            <TableHead>
  <Checkbox
    onCheckedChange={(checked) =>
      setSelectedUsers(
        checked ? new Set(filteredUsers.map((user) => user.id)) : new Set()
      )
    }
    checked={selectedUsers.size === filteredUsers.length}
    className="cursor-pointer h-5 w-5 align-middle"
  />
</TableHead>

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
                <TableRow key={user.id} className={selectedUsers.has(user.id) ? "bg-gray-200" : ""}>
                  <TableCell className="align-middle">
  <Checkbox
    checked={selectedUsers.has(user.id)}
    onCheckedChange={() => toggleUserSelection(user.id)}
    className="cursor-pointer h-5 w-5 align-middle"
  />
</TableCell>

<TableCell>
  <Link href={`/admin/users/${user.id}`} className="text-black underline hover:no-underline">
    {user.name || "—"}
  </Link>
</TableCell>

                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.address || "—"}</TableCell>
                  <TableCell>
                    <Badge className="bg-black text-white">{roleMap[user.role] || user.role}</Badge>
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

        {/* Pagination Fix */}
        <div className="flex items-center justify-between gap-8 mt-4 whitespace-nowrap w-full">
          {/* Rows Per Page Selector */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Label htmlFor={id} className="min-w-max text-xs">Rows per page</Label>
            <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
              <SelectTrigger id={id} className="w-fit" style={{ borderRadius: "6px" }}>
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>



          {/* Pagination Buttons */}
          <Pagination className="ml-auto flex justify-end">
            <PaginationContent>
                        {/* Page Count Info */}
          <p className="text-xs text-muted-foreground gap-2 whitespace-nowrap ">
            Showing {Math.min((page - 1) * perPage + 1, totalUsers)} - {Math.min(page * perPage, totalUsers)} of {totalUsers}
          </p>
              <PaginationItem>
                <Button onClick={() => setPage(1)} disabled={page === 1} style={{ borderRadius: "6px", border: "1px solid #ddd" }}>
                  <ChevronFirst size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ borderRadius: "6px", border: "1px solid #ddd" }}>
                  <ChevronLeft size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button onClick={() => setPage(page + 1)} disabled={page >= totalPages} style={{ borderRadius: "6px", border: "1px solid #ddd" }}>
                  <ChevronRight size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button onClick={() => setPage(totalPages)} disabled={page >= totalPages} style={{ borderRadius: "6px", border: "1px solid #ddd" }}>
                  <ChevronLast size={16} />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>            
    </div>
  );
}
