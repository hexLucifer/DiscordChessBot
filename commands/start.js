const { SlashCommandBuilder } = require('@discordjs/builders');
const renderBoard = require('../utils/renderBoard');
const { Chess } = require('chess.js'); // Assuming you're using the 'chess.js' library

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Starts a new chess game.'),
    async execute(interaction) {
        const chessGames = interaction.client.chessGames;

        // Check if there's an existing game
        if (chessGames.has(interaction.guildId)) {
            chessGames.delete(interaction.guildId); // Delete the existing game
        }

        // Create a new chess game
        const chess = new Chess();
        chessGames.set(interaction.guildId, chess);

        await interaction.reply({ content: 'Game started! Use `/move <your move>` to make a move.', ephemeral: false });
        await renderBoard(interaction, chess, true);
    },
};
