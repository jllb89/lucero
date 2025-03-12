import Sidebar from "../../components/admin/Sidebar";
import UploadForm from "../../components/admin/UploadForm";

export default function AdminUpload() {
  return (
    <div className="admin-container">
      <Sidebar />
      <main className="admin-content">
        <h1 className="text-2xl font-bold">📤 Upload New Book</h1>
        <UploadForm />
      </main>
    </div>
  );
}
