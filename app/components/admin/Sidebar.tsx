import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <h2 className="text-lg font-bold">📖 Lucero Admin</h2>
      <nav className="mt-4">
        <ul>
          <li><Link href="/admin">Dashboard</Link></li>
          <li><Link href="/admin/books">Books</Link></li>
          <li><Link href="/admin/users">Users</Link></li>
          <li><Link href="/admin/orders">Orders</Link></li>
          <li><Link href="/admin/shipments">Shipments</Link></li>
          <li><Link href="/admin/upload">Upload</Link></li>
          <li><Link href="/admin/settings">Settings</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
