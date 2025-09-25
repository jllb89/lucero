import Sidebar from "../../components/admin/Sidebar";

export default function AdminShipments() {
  return (
    <div className="admin-container">
      <Sidebar />
      <main className="admin-content">
        <h1 className="text-2xl font-bold">🚚 Shipments</h1>
        <p>Track pending and completed shipments.</p>
      </main>
    </div>
  );
}
