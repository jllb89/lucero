"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  userEmail: string;
  total: number;
  status: "Envío Pendiente" | "Completado" | "Cancelado" | "Devolución";
  createdAt: string;
}

// Define columns
const columns: ColumnDef<Order>[] = [
/*   {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  }, */
  {
    header: "Order ID",
    accessorKey: "id",
    cell: ({ row }) => (
      <Link href="/admin/orders" className="text-black underline hover:no-underline">
        {row.getValue("id")}
      </Link>
    ),
  },
  {
    header: "Usuario",
    accessorKey: "userEmail",
    cell: ({ row }) => <div className="text-black dark:text-white">{row.getValue("userEmail")}</div>,
  },
  {
    header: "Estado del pedido",
    accessorKey: "status",
    cell: ({ row }) => {
      const statusMap: Record<string, string> = {
        PENDING: "Pendiente",
        COMPLETED: "Completado",
        REFUNDED: "Devolución",
      };
  
      return (
        <Badge className="bg-black text-white">
          {statusMap[String(row.getValue("status"))] || String(row.getValue("status"))}
        </Badge>
      );
    },
  },
  
  {
    header: "Fecha",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <div className="text-black dark:text-white">{formatDate(row.getValue("createdAt"))}</div>
    ),
  },
  {
    header: "Total",
    accessorKey: "total",
    cell: ({ row }) => (
      <div className="text-black dark:text-white">{formatCurrency(row.getValue("total"))}</div>
    ),
  },
];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<{
    totalSales: number;
    pendingOrders: number;
    totalBooks: number;
    recentOrders: Order[];
  }>({
    totalSales: 0,
    pendingOrders: 0,
    totalBooks: 0,
    recentOrders: [],
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const data = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }
    fetchDashboardData();
  }, []);

  const table = useReactTable({
    data: dashboardData.recentOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 bg-neutral-100 min-h-screen">
      {/* Breadcrumbs */}
      <Breadcrumb />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white border-none shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="font-regular text-black">Total de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(dashboardData.totalSales)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="font-regular text-black">Órdenes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData.pendingOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="font-regular text-black">Libros en Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData.totalBooks}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Recent Orders</h2>
        <Table className="bg-white border-none rounded-xl overflow-hidden">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No recent orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Total de ventas de órdenes recientes:</TableCell>
              <TableCell>
                {formatCurrency(
                  dashboardData.recentOrders.reduce((total, order) => total + order.total, 0)
                )}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
