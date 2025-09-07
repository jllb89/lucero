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
import { toast } from "sonner"; // ✅ Notifications

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress?: string;
  orderItems?: { book?: { title?: string } }[];
  user?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
  };
}

interface ApiResponse {
  orders: Order[];
  totalOrders: number;
  totalPages: number;
  currentPage: number;
}

const statusMap: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const validStatuses = Object.keys(statusMap);

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const id = useId();

  // ✅ Fetch Orders Function
  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?page=${page}&perPage=${perPage}&search=${search}`);
      const data: ApiResponse = await res.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalOrders(data.totalOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, perPage, search]);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const updated = new Set(prev);
      updated.has(orderId) ? updated.delete(orderId) : updated.add(orderId);
      return updated;
    });
  };

  const handleStatusChange = async (status: string) => {
    if (selectedOrders.size === 0) return;

    setUpdatingStatus(true);
    try {
      await Promise.all(
        Array.from(selectedOrders).map(async (orderId) => {
          const response = await fetch(`/api/admin/orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });

          if (!response.ok) {
            throw new Error("Failed to update order status");
          }
        })
      );

      toast.success("Order status updated successfully!");
      setSelectedOrders(new Set()); // ✅ Clear selection after update
      await fetchOrders(); // ✅ Refresh orders list after updating order status
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="p-6 bg-neutral-100 min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-gray-500 text-sm mb-4">
        <Link href="/admin" className="hover:underline">Lucero Admin Dashboard</Link> / Orders
      </nav>
  
       {/* Orders Table */}
       <div className="bg-white rounded-xl p-6 relative">
        <h2 className="text-xl font-regular text-black mb-4">Orders</h2>

        <div className="overflow-x-auto w-full">
          <Table className="bg-white border-none rounded-xl min-w-max">
            <TableHeader>
              {/* Search & Status Selector Row */}
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableCell colSpan={9} className="p-3 pb-5">
                  <div className="flex items-center justify-between">
                    {/* Search Input */}
                    <div className="relative w-1/3">
                      <Label htmlFor={id} className="sr-only">Search</Label>
                      <div className="relative flex items-center">
                        <Search className="absolute left-3 text-muted-foreground/80 peer-disabled:opacity-50" size={18} />
                        <Input
                          id={id}
                          type="text"
                          placeholder="  Search by Order ID, User Name, or Username..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          style={{ borderRadius: "6px" }}
                          className="peer w-full pe-9 pl-10 border border-gray-300"
                        />
                        {search && (
                          <X className="absolute right-3 text-muted-foreground/80 cursor-pointer" size={18} onClick={() => setSearch("")} />
                        )}
                      </div>
                    </div>

                    {/* Status Selector (Only appears when orders are selected, aligned to the right) */}
                    {selectedOrders.size > 0 && (
                      <Select onValueChange={handleStatusChange} disabled={updatingStatus}>
                        <SelectTrigger className="border-gray-300 rounded-lg focus:ring-gray-400 animate-fade-in">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-md animate-fade-in">
                          {validStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {statusMap[status]} {/* ✅ Displays mapped names */}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </TableCell>
              </TableRow>
  
              {/* Table Headers */}
              <TableRow>
                <TableHead>
                  <Checkbox
                    onCheckedChange={(checked) =>
                      setSelectedOrders(
                        checked ? new Set(orders.map((order) => order.id)) : new Set()
                      )
                    }
                    checked={selectedOrders.size === orders.length}
                    className="cursor-pointer h-5 w-5 align-middle"
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Phone number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                // Format date/time for Mexico City
                const date = new Date(order.createdAt);
                const mxTime = date.toLocaleString('es-MX', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                // Get customer name, phone, and address from order only
                const email = (order as any).email || '—';
                const customer = (order as any).name || '—';
                const phone = (order as any).phoneNumber || '—';
                const address = (order as any).shippingAddress || (order as any).address || '—';

                // Get product name(s) from orderItems, fallback to order.product if present
                let product = '—';
                let productList: string[] = [];
                if (order.orderItems && order.orderItems.length > 0) {
                  productList = order.orderItems.map((oi: any) => oi.book?.title || oi.book?.name).filter(Boolean);
                  if (productList.length === 1) {
                    product = productList[0];
                  } else if (productList.length > 1) {
                    product = productList.join(', ');
                  }
                } else if ((order as any).product) {
                  product = (order as any).product;
                  productList = [product];
                }
                return (
                  <TableRow key={order.id} className={selectedOrders.has(order.id) ? "bg-gray-200" : ""}>
                    <TableCell className="align-middle">
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                        className="cursor-pointer h-5 w-5 align-middle"
                      />
                    </TableCell>
                    <TableCell><span className="text-black underline cursor-pointer">{order.id}</span></TableCell>
                    <TableCell>{email}</TableCell>
                    <TableCell>{customer}</TableCell>
                    <TableCell>{mxTime}</TableCell>
                    <TableCell>{phone}</TableCell>
                    <TableCell title={productList.length > 1 ? productList.join(', ') : undefined} style={{ cursor: productList.length > 1 ? 'pointer' : undefined }}>{product}</TableCell>
                    <TableCell>{address}</TableCell>
                    <TableCell><Badge className="bg-black text-white">{statusMap[order.status] || order.status}</Badge></TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
  
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
  
          {/* Page Count Info */}
          <p className="text-xs text-muted-foreground gap-2 whitespace-nowrap">
            Showing {Math.min((page - 1) * perPage + 1, totalOrders)} - {Math.min(page * perPage, totalOrders)} of {totalOrders}
          </p>
  
          {/* Pagination Buttons */}
          <Pagination className="ml-auto flex justify-end">
            <PaginationContent>
              <PaginationItem>
                <Button onClick={() => setPage(1)} disabled={page === 1} style={{ borderRadius: "6px" }}>
                  <ChevronFirst size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ borderRadius: "6px" }}>
                  <ChevronLeft size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button onClick={() => setPage(page + 1)} disabled={page >= totalPages} style={{ borderRadius: "6px" }}>
                  <ChevronRight size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button onClick={() => setPage(totalPages)} disabled={page >= totalPages} style={{ borderRadius: "6px" }}>
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