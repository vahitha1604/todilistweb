require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/todolist";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// User Schema & Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Task Schema & Model
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});
const Task = mongoose.model("Task", taskSchema);

// JWT Authentication Middleware
const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Validate Email & Password
const validateEmailAndPassword = (email, password) => {
  if (!email || !password) return "Please provide both email and password";
  return null;
};

// Signup Route
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  const validationError = validateEmailAndPassword(email, password);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Error signing up", error: err.message });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const validationError = validateEmailAndPassword(email, password);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

// Create Task (Protected)
app.post("/api/tasks", authenticateUser, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Task title is required" });

  try {
    const newTask = new Task({ userId: req.userId, title, completed: false });
    await newTask.save();

    console.log("New Task Added:", newTask); // Debugging
    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (err) {
    res.status(500).json({ message: "Error adding task", error: err.message });
  }
});

// Get All Tasks for Logged-in User (Protected)
app.get("/api/tasks", authenticateUser, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    console.log("Tasks Retrieved:", tasks); // Debugging
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
  }
});

// Update Task (Mark as Completed) (Protected)
app.put("/api/tasks/:taskId", authenticateUser, async (req, res) => {
  const { taskId } = req.params;
  const { completed } = req.body;

  try {
    const task = await Task.findOneAndUpdate({ _id: taskId, userId: req.userId }, { completed }, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (err) {
    res.status(500).json({ message: "Error updating task", error: err.message });
  }
});

// Delete Task (Protected)
app.delete("/api/tasks/:taskId", authenticateUser, async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findOneAndDelete({ _id: taskId, userId: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task", error: err.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
