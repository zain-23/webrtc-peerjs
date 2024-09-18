import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { ExpressPeerServer } from "peer";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(express.json());

const server = createServer(app);

const peerServer = ExpressPeerServer(server, {
  allow_discovery: true,
});

app.use("/my-app", peerServer);

server.listen(PORT, () => {
  console.log("server is running ");
});
