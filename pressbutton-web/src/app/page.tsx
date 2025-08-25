import "server-only";

type User = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

async function fetchUsers(): Promise<User[]> {
  const base = process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "http://localhost:3001";
  const res = await fetch(`${base}/api/v1/users`, {
    // 后台列表通常要最新数据：
    cache: "no-store",
    // 或者：next: { revalidate: 30 }  // 30s 缓存
  });
  if (!res.ok) throw new Error(`Fetch users failed: ${res.status}`);
  return res.json();
}

export default async function UsersPage() {
  const users = await fetchUsers();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Users</h1>
      {users.length === 0 ? (
        <p>No users</p>
      ) : (
        <table className="min-w-[600px] border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
