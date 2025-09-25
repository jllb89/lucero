import Sidebar from "../../components/admin/Sidebar";

export default function AdminSettings() {
  return (
    <div className="admin-container">
      <Sidebar />
      <main className="admin-content">
        <h1 className="text-2xl font-bold">⚙️ Settings</h1>
        <p>Manage payment methods, discounts, and store configurations.</p>
      </main>
    </div>
  );
}
