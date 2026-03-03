import http from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { setSocketServer } from "./config/socket.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_ORIGIN,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("subscribe-vehicle", (vehicleId: string) => {
    socket.join(`vehicle:${vehicleId}`);
  });
});

setSocketServer(io);

server.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
