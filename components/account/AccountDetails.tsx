"use client";

export default function AccountDetails({ user }: { user: any }) {
  return (
    <div className="mb-4">
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  );
}
