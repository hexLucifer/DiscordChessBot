const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Chess } = require('chess.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();
client.chessGames = new Map(); // Initialize chess games storage

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Load command files
const commands = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Register slash commands
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Event listener for when the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event listener for interaction commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        if (command.data.name === 'start') {
            let chess = new Chess();
            client.chessGames.set(interaction.guildId, chess);
        }
        
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: false });
    }
});

client.login(process.env.TOKEN);
