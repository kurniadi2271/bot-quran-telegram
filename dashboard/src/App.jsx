import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [stats, setStats] = useState({ total: 0 });
  const [users, setUsers] = useState([]);

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

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">
        Quran Bot Dashboard
      </h1>

      <div className="bg-green-500 text-white p-5 rounded-xl w-64">
        <h2>Total Subscriber</h2>
        <p className="text-4xl">{stats.total}</p>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl mb-3">User List</h2>

        <table className="border w-full">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Chat ID</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border p-2">{u.id}</td>
                <td className="border p-2">{u.chat_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;