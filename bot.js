const { Client, GatewayIntentBits, CommandInteraction, MessageAttachment, ApplicationCommandOptionType } = require('discord.js');
const { Chess } = require('chess.js');
const { createCanvas, loadImage } = require('canvas');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const chess = new Chess();

client.once('ready', async () => {
    console.log('Ready!');
    // Register slash commands when the bot is ready
    for (const guild of client.guilds.cache.values()) {
        try {
            await guild.commands.set([]); // Clear existing commands to prevent duplicates
            await guild.commands.create({
                name: 'start',
                description: 'Starts a new chess game.',
            });
            await guild.commands.create({
                name: 'move',
                description: 'Make a move in the chess game.',
                options: [
                    {
                        type: ApplicationCommandOptionType.STRING,
                        name: 'move',
                        description: 'The move to make (e.g., e2-e4).',
                        required: true,
                    },
                ],
            });
            await guild.commands.create({
                name: 'board',
                description: 'Displays the current chess board.',
            });
            console.log(`Slash commands registered in ${guild.name}`);
        } catch (error) {
            console.error(`Failed to register slash commands in ${guild.name}:`, error);
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'start') {
        chess.reset();
        await interaction.reply({ content: 'Game started! Use `/move <your move>` to make a move.', ephemeral: true });
        await renderBoard(interaction);
    } else if (commandName === 'move') {
        const move = options.getString('move');
        const result = chess.move(move, { sloppy: true });
        if (result) {
            await interaction.reply({ content: `Move: ${move}`, ephemeral: true });
            await renderBoard(interaction);
            if (chess.game_over()) {
                await interaction.followUp('Game over!');
            }
        } else {
            await interaction.reply({ content: 'Invalid move! Please try again.', ephemeral: true });
        }
    } else if (commandName === 'board') {
        await renderBoard(interaction);
    }
});

async function renderBoard(interaction) {
    const canvas = createCanvas(400, 400);
    const ctx = canvas.getContext('2d');

    // Load the chessboard image
    const boardImage = await loadImage('./chessboard.png');
    ctx.drawImage(boardImage, 0, 0, 400, 400);

    // Chess pieces mapping to unicode and image
    const pieceToUnicode = {
        wp: '♙', wr: '♖', wn: '♘', wb: '♗', wq: '♕', wk: '♔',
        bp: '♟', br: '♜', bn: '♞', bb: '♝', bq: '♛', bk: '♚',
    };

    const pieceImages = {
        wp: await loadImage('./pieces/white-pawn.png'),
        wr: await loadImage('./pieces/white-rook.png'),
        wn: await loadImage('./pieces/white-knight.png'),
        wb: await loadImage('./pieces/white-bishop.png'),
        wq: await loadImage('./pieces/white-queen.png'),
        wk: await loadImage('./pieces/white-king.png'),
        bp: await loadImage('./pieces/black-pawn.png'),
        br: await loadImage('./pieces/black-rook.png'),
        bn: await loadImage('./pieces/black-knight.png'),
        bb: await loadImage('./pieces/black-bishop.png'),
        bq: await loadImage('./pieces/black-queen.png'),
        bk: await loadImage('./pieces/black-king.png'),
    };

    // Draw pieces on the board
    const squareSize = 50;
    const xOffset = 50;
    const yOffset = 50;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = chess.board()[row][col];
            if (piece) {
                const key = piece.color + piece.type;
                const image = pieceImages[key];
                ctx.drawImage(image, col * squareSize + xOffset, row * squareSize + yOffset, squareSize, squareSize);
            }
        }
    }

    // Convert the canvas to a buffer
    const buffer = canvas.toBuffer();

    // Create a new message attachment
    const attachment = new MessageAttachment(buffer, 'chessboard.png');

    // Reply to the interaction with the attachment
    await interaction.reply({ files: [attachment], ephemeral: true });
}

client.login(process.env.DISCORD_TOKEN);
