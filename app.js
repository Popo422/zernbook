import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";

/*CONFIGURATION*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common")); //logger ng middleware
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use("/assets", express.static(path.join(__dirname, "public/assets"))); //set directory where we keep our images locally

/*FILE STORAGE*/
//github instruction ng multer lang to

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets"); //dito iuupload ung file
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
app.get("/", async (req, res) => {
  //req request body from frontend res what we send back to frontend
  try {
    res.status(201).json({ message: "HELLO" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/*Routes With Files*/
app.post("/auth/register", upload.single("picture"), register); //middlware ung upload controller ung register
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/*Routes*/
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/*MONGOOSE*/
const PORT = process.env.port || 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // app.listen(PORT, () => console.log(`Server Port : ${PORT}`));
    server.listen(PORT, () => {
      console.log("SERVER RUNNING in ", PORT);
    });
  })
  .catch((error) => console.log(`${error} did not connect`));

/* IO */

const io = new Server(server, {
  cors: {
    origin: "https://zernbook-ui.vercel.app/", //client calls socket io
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});
