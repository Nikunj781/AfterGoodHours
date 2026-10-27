import jwt from "jsonwebtoken";
import User from "./models/user.model.js";

const onlineUsers = new Map(); // userId -> socketId

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie
        ?.split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`Socket connected: ${socket.user.name} (${userId})`);

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
};

export const notifyUser = (io, userId, event, data) => {
  io.to(`user:${userId.toString()}`).emit(event, data);
};

