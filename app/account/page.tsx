import { getUser } from "@/lib/actions";
import AccountDetails from "@/components/account/AccountDetails";

export default async function MyAccount() {
  const user = await getUser();

  if (!user) {
    return <div className="p-4 text-red-500">Unauthorized. Please log in.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>

      {/* User Details */}
      <AccountDetails user={user} />

      {/* Purchased Books */}
      <h2 className="text-xl font-semibold mt-6 mb-3">My Purchased Books</h2>
      {user.orders.length === 0 ? (
        <p>You haven't purchased any books yet.</p>
      ) : (
        <ul className="space-y-3">
          {user.orders.map((order) => (
            <li key={order.id} className="border p-3 rounded">
              {order.orderItems.map((item) => (
                <span key={item.id}>
                  {item.book.title} - {item.book.digitalPrice ? "Digital" : "Physical"}
                </span>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
