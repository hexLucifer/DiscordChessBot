const { createCanvas, loadImage, registerFont } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

let message = null;

module.exports = async function renderBoard(interaction, chess, sendNewMessage = false) {
    const canvas = createCanvas(440, 440); // Increased canvas size to accommodate the border and labels
    const ctx = canvas.getContext('2d');

    // Draw the chessboard border
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 440, 440);

    // Load the chessboard image
    const boardImage = await loadImage('./chessboard.png');
    ctx.drawImage(boardImage, 20, 20, 400, 400); // Offset to leave space for the border

    // Load the font for chess notation
    registerFont('./fonts/chess-notation.ttf', { family: 'Chess' });

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
    const squareSize = 400 / 8; // Calculate the square size dynamically

    // Draw pieces
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = chess.board()[7 - row][col]; // Reverse row index to standard orientation

            if (piece) {
                const key = piece.color + piece.type;
                const image = pieceImages[key];
                ctx.drawImage(image, col * squareSize + 20, (7 - row) * squareSize + 20, squareSize, squareSize);
            }
        }
    }

    // Draw the chessboard labels on the border
    ctx.font = 'bold 20px Chess';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'white';

    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (let i = 0; i < 8; i++) {
        // Draw column labels (A-H)
        ctx.fillText(columns[i], squareSize * i + squareSize / 2 + 20, 444); // Adjusted vertical position

        // Draw row labels (1-8)
        ctx.fillText(8 - i, 10, squareSize * i + squareSize / 2 + 30);
    }

    // Convert the canvas to a buffer
    const buffer = canvas.toBuffer();

    // Create a new message attachment with the buffer
    const attachment = new AttachmentBuilder(buffer, 'chessboard.png');

    try {
        if (sendNewMessage) {
            // Send a new message
            message = await interaction.editReply({ files: [attachment] });
        } else {
            // Edit the existing message
            if (!message) {
                // If message is not yet set, send a new message
                message = await interaction.fetchReply();
                await interaction.editReply({ files: [attachment] });
            } else {
                // If message is set, edit the existing message
                await message.edit({ files: [attachment] });
            }
        }
    } catch (error) {
        console.error('Error editing or replying to interaction:', error);
    }
};
