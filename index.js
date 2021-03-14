require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');

// Creating a bot instance
const client = new Discord.Client();
// Creating a struture for bot commands
client.commands = new Discord.Collection();
// Creating a struture for Queue bot
client.queues = new Map();
// Setting a prefix
const prefix = process.env.PREFIX;
const token = process.env.BOT_TOKEN;

// Taking all the directory's folders
const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

// Taking all the folder's files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Display a message if bot when bot is running
client.once('ready', () => {
    console.log('RUNNING!!!!!!!');
});

// Loggin on Discord
client.login(token);

// Setting up the bot to listen every message
client.on('message', async message => {
    // Verifying if the message is a command
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Taking only the command, without the args
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Verifying if the command exists
    if (!client.commands.has(commandName)) return message.reply('Esse comando não existe!');

    // Calling the typed command
    const command = client.commands.get(commandName);

    // Veryfing if args were given
    if (command.args && !args.length) {
        return message.channel.send(`Você não forneceu nenhum argumento, ${message.author}`);
    }

    // Executing the command
    try {
        command.execute(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply('Houve um erro executar esse comando.');
    }

    // console.log(client.queues);
});