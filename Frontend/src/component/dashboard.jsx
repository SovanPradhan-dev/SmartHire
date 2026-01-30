import { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/leaderboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-start pt-16">
      <div className="w-[600px] bg-[#111] p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          🏆 Leaderboard
        </h2>

        {data.length === 0 ? (
          <p className="text-center text-gray-400">No scores yet</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-2 text-left">Rank</th>
                <th className="py-2 text-left">User</th>
                <th className="py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-b border-gray-800 hover:bg-[#1a1a1a]"
                >
                  <td className="py-3">{index + 1}</td>
                  <td className="py-3">{item.userId.username}</td>
                  <td className="py-3 text-right font-semibold">
                    {item.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
