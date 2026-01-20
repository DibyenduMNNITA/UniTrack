const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 THIS SERVES ALL YOUR HTML, CSS, JS FILES
app.use(express.static(path.join(__dirname)));

// ---------------- CONNECT TO MONGODB ----------------
mongoose.connect("mongodb://127.0.0.1:27017/unitrack")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ---------------- USER MODEL ----------------
const User = mongoose.model("User", {
    email: String,
    password: String,
    tasks: [String],
    internships: [
        {
            company: String,
            role: String,
            status: String
        }
    ]
});


// ---------------- TASKS ----------------
app.post("/getTasks", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    res.json(user.tasks);
});

app.post("/addTask", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    user.tasks.push(req.body.task);
    await user.save();
    res.json(user.tasks);
});

app.post("/deleteTask", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    user.tasks = user.tasks.filter(t => t !== req.body.task);
    await user.save();
    res.json(user.tasks);
});



// ---------------- START SERVER ----------------
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});