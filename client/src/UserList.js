import React, { useEffect, useState } from "react";

function UserList({ socket, selectUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Listen for the updated user list from the server
    socket.on("update_user_list", (userList) => {
      setUsers(userList);
    });
  }, [socket]);

  return (
    <div className="user-list">
      <h3>Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id} onClick={() => selectUser(user)}>
            <img
              src={user.avatar || "path/to/default-avatar.jpg"}
              alt={`${user.username}'s avatar`}
              className="avatar"
            />
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
