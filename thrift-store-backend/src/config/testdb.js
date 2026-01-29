require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db");

connectDB();

const TestModel = mongoose.model("Test", new mongoose.Schema({ name: String }));

async function saveTestData() {
    const testData = new TestModel({ name: "Test Entry" });
    await testData.save();
    console.log("Test data saved successfully!");
    mongoose.connection.close();
}

saveTestData();
