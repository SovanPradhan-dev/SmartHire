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
    <div className="min-h-screen bg-[#050505] text-white flex justify-center items-start pt-20 px-4">
      
      {/* Card */}
      <div className="w-full max-w-2xl bg-[#0d0d0d]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.1)] p-6">

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-8 
          bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 
          bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
          ⚡ Leaderboard
        </h2>

        {data.length === 0 ? (
          <p className="text-center text-gray-500">
            No scores yet
          </p>
        ) : (
          <table className="w-full border-separate border-spacing-y-2">
            
            {/* Head */}
            <thead>
              <tr className="text-gray-400 text-sm uppercase tracking-wider">
                <th className="text-left px-3">#</th>
                <th className="text-left px-3">User</th>
                <th className="text-right px-3">Assessment</th>
                <th className="text-right px-3">Interview</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item._id}
                  className="bg-[#111]/70 border border-cyan-500/10 rounded-lg 
                  hover:scale-[1.02] hover:border-cyan-400/40 
                  hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] 
                  transition-all duration-300"
                >
                  <td className="py-3 px-3 font-semibold text-cyan-400">
                    {index + 1}
                  </td>

                  <td className="py-3 px-3">
                    {item.userId.username}
                  </td>

                  <td className="py-3 px-3 text-right font-semibold text-purple-400">
                    {item.score}
                  </td>

                  <td className="py-3 px-3 text-right font-semibold text-pink-400">
                    {item.score_inter}
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