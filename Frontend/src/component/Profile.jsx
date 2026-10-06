import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [currUser, setCurrUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user"));
    } catch {
      storedUser = null;
    }

    // If cached user already has a picture, show it immediately,
    // then refresh in background. Otherwise fetch fresh profile
    // (handles users who logged in before picture support was added).
    if (storedUser?.picture) {
      setCurrUser(storedUser);
    }

    if (!token) {
      if (storedUser && !storedUser.picture) setCurrUser(storedUser);
      return;
    }

    axios
      .get("http://localhost:3000/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const fresh = response.data;
        setCurrUser(fresh);
        // Refresh cache so Nav/ProfileMenu avatars pick up Google picture
        localStorage.setItem("user", JSON.stringify(fresh));
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        if (storedUser && !storedUser.picture) setCurrUser(storedUser);
      });
  }, []);

  const displayName =
    currUser?.username || currUser?.name || currUser?.email?.split("@")[0] || "User";
  const avatarUrl =
    currUser?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row items-center gap-6">
        
        {/* Profile Image */}
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
        />

        {/* User Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{displayName}</h2>
          <p className="text-gray-600">B.Tech CSE (Data Science)</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div>
              <span className="font-semibold">Email:</span>
              <p>{currUser?.email}</p>
            </div>

            <div>
              <span className="font-semibold">Phone:</span>
              <p>{currUser?.phone}</p>
            </div>

            <div>
              <span className="font-semibold">Quiz Score:</span>
              <p>{currUser?.quizScore}</p>
            </div>

            <div>
              <span className="font-semibold">Interviews Attended:</span>
              <p>{currUser?.interviewsAttended}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <h3 className="text-xl font-bold">{currUser?.interviewsAttended}</h3>
          <p>Mock Interviews</p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg text-center">
          <h3 className="text-xl font-bold">{currUser?.quizScore}</h3>
          <p>Quiz Accuracy</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <h3 className="text-xl font-bold">{currUser?.performanceRating}</h3>
          <p>Performance Rating</p>
        </div>
      </div>

      {/* Edit Button */}
      <div className="mt-6 text-center">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;