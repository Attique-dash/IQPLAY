import mongoose from "mongoose";

// Define the Game Schema
const GameSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  selectedGames: [
    {
      title: String,
      imageUrl: String,
    },
  ],
});

// Check if the model is already defined
const Game = mongoose.models.Game || mongoose.model("Game", GameSchema);

export default Game;
