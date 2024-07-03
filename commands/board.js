const { SlashCommandBuilder } = require('@discordjs/builders');
const renderBoard = require('../utils/renderBoard');
const { Chess } = require('chess.js'); // Ensure chess.js is imported

module.exports = {
    data: new SlashCommandBuilder()
        .setName('board')
        .setDescription('Displays the current chess board.'),
    async execute(interaction) {
        // Initialize chessGames if it doesn't exist
        if (!interaction.client.chessGames) {
            interaction.client.chessGames = new Map();
        }

        // Get the chess game for the guild
        let chess = interaction.client.chessGames.get(interaction.guildId);

        // If there is no chess game, initialize a new one
        if (!chess) {
            chess = new Chess();
            interaction.client.chessGames.set(interaction.guildId, chess);
            await interaction.reply({ content: 'New chess game initialized!', ephemeral: false });
            await renderBoard(interaction, chess, true); // Send a new message
        } else {
            await interaction.reply({ content: 'Here is the current chess board:', ephemeral: false });
            await renderBoard(interaction, chess, true); // Send a new message
        }
    },
};
