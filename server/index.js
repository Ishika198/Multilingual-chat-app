import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import translate from 'google-translate-api-x';
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Store user info when they provide their language preference
  socket.on("user_info", ({ username, preferredLanguage }) => {
    users[socket.id] = { id: socket.id, username, preferredLanguage };
    io.emit("update_user_list", Object.values(users));
    console.log(`User Info: ${username}, Language: ${preferredLanguage}`);
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    const { recipient,author, message, time } = data;
    console.log("Message Data: ", data);
    try {
      Object.keys(users).forEach(async (recipientId) => {
        if (recipientId !== socket.id && recipient === recipientId) {
        // Ensure the sender doesn't receive their own message
          const recipientLanguage = users[recipientId]?.preferredLanguage;
  
          if (!recipientLanguage) {
            console.log("Recipient language not found. Sending original message.");
            io.to(recipientId).emit("receive_message", { author, message, time });
          } else {
            try {
              // Translate the message to the recipient's preferred language
              const translatedMessage = await translate(message, {
                to: recipientLanguage,
                forceTo: true,
              });
  
              // Send translated message to the recipient
              io.to(recipientId).emit("receive_message", {
                author,
                message: translatedMessage.text,
                time,
              });
            } catch (translationError) {
              console.error("Error translating message:", translationError);
  
              // If translation fails, send the original message
              io.to(recipientId).emit("receive_message", { author, message, time });
            }
          }
        }
      });
    } catch (error) {
      console.error("Error broadcasting message:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    delete users[socket.id];
    io.emit("update_user_list", Object.values(users));
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
