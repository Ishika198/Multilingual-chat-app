import "./App.css";
import io from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "./Chat";
import languages from "./language";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("hi");
  const [showChat, setShowChat] = useState(false);
  const [userList, setUserList] = useState([]); // List of active users
  const [activeUser, setActiveUser] = useState(null); // Currently selected user for chat

  const joinChat = () => {
    if (username !== "" && preferredLanguage !== "") {
      socket.emit("user_info", { username, preferredLanguage }); 
      setShowChat(true);
    }
  };

  useEffect(() => {
    // Listen for the updated user list from the server
    socket.on("update_user_list", (users) => {
      setUserList(users);
    });

    return () => {
      socket.off("update_user_list");
    };
  }, [socket]);

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Chat</h3>
          <input
            type="text"
            placeholder="Your Name"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <select
            defaultValue="hi"
            value={preferredLanguage}
            onChange={(event) => setPreferredLanguage(event.target.value)}
          >
            {Object.entries(languages).map(([code, language]) => (
              <option key={code} value={code}>
                {language}
              </option>
            ))}
          </select>

          <button onClick={joinChat}>Start Chat</button>
        </div>
      ) : (
        <div className="chatContainer">
          {/* Left Section: Reserved for recent chats */}
          <div className="leftSection">
            <p>Recent Chats (coming soon)</p>
          </div>

          {/* Center Section: Chat Window */}
          <div className="chatWindow">
            <Chat
              socket={socket}
              username={username}
              preferredLanguage={preferredLanguage}
              activeUser={activeUser}
            />
          </div>

          {/* Right Section: Active User List */}
          <div className="userList">
            <h4>Active Users</h4>
            <ul>
              {userList
                .filter((user) => user.username !== username) // Exclude self
                .map((user) => (
                  <li
                    key={user.id}
                    className={activeUser?.id === user.id ? "active" : ""}
                    onClick={() => setActiveUser(user)}
                  >
                    {user.username}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
