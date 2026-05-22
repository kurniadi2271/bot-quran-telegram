import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [stats, setStats] = useState({ total: 0 });
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const statsRes = await axios.get(`${API}/stats`);
        const usersRes = await axios.get(`${API}/users`);

        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.log(err.message);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        String(u.id).includes(q) ||
        String(u.chat_id).includes(q) ||
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.username || "").toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Quran Bot Dashboard</h1>
          <p className="text-sm text-gray-500">Subscriber & user overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">Total Subscribers</div>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <div className="text-sm text-gray-500">Subscribers</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-sm">
          <div className="text-sm text-gray-500">Users (with name)</div>
          <div className="text-2xl font-semibold mt-2">{users.filter(u=>u.full_name).length}</div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-sm">
          <div className="text-sm text-gray-500">Users (with username)</div>
          <div className="text-2xl font-semibold mt-2">{users.filter(u=>u.username).length}</div>
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">User List</h2>
        <input
          className="border rounded-lg px-3 py-2 w-64"
          placeholder="Search id, name, username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Username</th>
              <th className="text-left px-4 py-3">Masked ID</th>
              <th className="text-left px-4 py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 border-b">
                <td className="px-4 py-3">{u.id}</td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="avatar">{getInitials(u.full_name || u.username || String(u.chat_id))}</div>
                  <div>
                    <div className="font-medium">{u.full_name || '-'}</div>
                    <div className="text-sm text-gray-500">{u.email || ''}</div>
                  </div>
                </td>
                <td className="px-4 py-3">{u.username || '-'}</td>
                <td className="px-4 py-3">{maskId(u.chat_id)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(u.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;

function maskId(id) {
  if (!id) return "-";
  const s = String(id);
  if (s.length <= 4) return "****";
  const visible = s.slice(-3);
  const masked = "*".repeat(Math.max(0, s.length - 3)) + visible;
  return masked;
}

function getInitials(text) {
  if (!text) return "U";
  const parts = text.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}