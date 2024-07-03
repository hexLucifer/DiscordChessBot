const { SlashCommandBuilder } = require('@discordjs/builders');
const { Chess } = require('chess.js');
const renderBoard = require('../utils/renderBoard');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Make a move in the chess game.')
        .addStringOption(option =>
            option.setName('move')
                .setDescription('The move to make (e.g., e2-e4).')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false }); // Defer and make reply ephemeral

        const move = interaction.options.getString('move').toLowerCase(); // Ensure move is lowercase

        // Check if the game exists in the current guild
        if (!interaction.guildId) {
            await interaction.followUp({ content: 'This command must be used in a server.', ephemeral: false });
            return;
        }

        let chess = interaction.client.chessGames?.get(interaction.guildId);
        const startResponse = interaction.client.chessStartResponses?.get(interaction.guildId);

        // Initialize a new game if it doesn't exist
        if (!chess) {
            chess = new Chess();
            interaction.client.chessGames.set(interaction.guildId, chess);
        }

        try {
            // Attempt to make the move
            const result = chess.move(move, { sloppy: true });

            if (result !== null) {
                // Move was valid
                if (startResponse) {
                    await interaction.editReply({ content: `Move: ${move}`, ephemeral: false });
                }
                await renderBoard(interaction, chess, false);

                // Check if the game is over
                if (chess.game_over) {
                    await interaction.followUp({ content: 'Game over!', ephemeral: false });
                    interaction.client.chessGames.delete(interaction.guildId); // Remove the game from memory
                    interaction.client.chessStartResponses.delete(interaction.guildId); // Remove start response from memory
                }
            } else {
                // Invalid move
                await interaction.editReply({ content: 'Invalid move! Please try again.', ephemeral: false });
            }

            // Delete the message after 5 seconds
            setTimeout(async () => {
                await interaction.deleteReply();
            }, 5000);

        } catch (error) {
            // Handle any errors from chess.js (e.g., invalid move)
            console.error(error);
            await interaction.editReply({ content: 'Invalid move! Please try again.', ephemeral: false });
        }
    },
};
