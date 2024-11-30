import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, preferredLanguage, activeUser }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messagesByUser, setMessagesByUser] = useState({});

  const sendMessage = async () => {
    if (currentMessage !== "" && activeUser) {
      const messageData = {
        author: username,
        message: currentMessage,
        recipient: activeUser.id,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      // Emit the message to the server
      await socket.emit("send_message", messageData);

      // Add the message to the local state (for the current user only)
      setMessagesByUser((prev) => ({
        ...prev,
        [activeUser.username]: [
          ...(prev[activeUser.username] || []),
          { ...messageData, isSelf: true },
        ],
      }));

      setCurrentMessage(""); // Clear input field
    }
  };

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      const { author } = data;

      // Add the received message to the state (for the sender only)
      setMessagesByUser((prev) => ({
        ...prev,
        [author]: [...(prev[author] || []), data],
      }));
    });

    return () => {
      // Cleanup listener on unmount
      socket.off("receive_message");
    };
  }, [socket]);

  // Get messages for the active user
  const activeUserMessages = messagesByUser[activeUser?.username] || [];

  return (
    <div className="chat-window">
      {activeUser ? (
        <>
          <div className="chat-header">
            <p>Chat with {activeUser.username}</p>
          </div>
          <div className="chat-body">
            <ScrollToBottom className="message-container">
              {activeUserMessages.map((messageContent, index) => (
                <div
                  key={index}
                  className="message"
                  id={messageContent.isSelf ? "you" : "other"}
                >
                  <div>
                    <div className="message-content">
                      <p>{messageContent.message}</p>
                    </div>
                    <div className="message-meta">
                      <p id="time">{messageContent.time}</p>
                      <p id="author">{messageContent.author}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollToBottom>
          </div>
          <div className="chat-footer">
            <input
              type="text"
              value={currentMessage}
              placeholder="Type your message..."
              onChange={(event) => setCurrentMessage(event.target.value)}
              onKeyPress={(event) => {
                event.key === "Enter" && sendMessage();
              }}
            />
            <button onClick={sendMessage}>&#9658;</button>
          </div>
        </>
      ) : (
        <div className="no-active-user">
          <p>Select a user to start chatting.</p>
        </div>
      )}
    </div>
  );
}

export default Chat;
