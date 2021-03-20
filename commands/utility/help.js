const { MessageEmbed } = require('discord.js');

const execute = (message) => {
    const help = new MessageEmbed()
        .setTitle('LISTA DE COMANDOS: 📄')
        .addField('`!play`', 'Digite `!play` seguido de um link ou nome da música que você quer colocar para tocar.')
        .addField('`!pause`', 'Digite `!pause` para pausar a música que está tocando.')
        .addField('`!resume`', 'Digite `!resume` para retomar a música que está pausada.')
        .addField('`!skip`', 'Digite `!skip` para pular a música que está tocando.')
        .addField('`!help`', 'Digite `!help` para exibir uma lista de comandos.')
        .setColor('#02fc01');
    return message.channel.send(help);
};
module.exports = {
    name: "help",
    description: "Show the details about all commands",
    execute,
};