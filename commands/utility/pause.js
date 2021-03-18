const { MessageEmbed } = require('discord.js');

const execute = (client, message) => {
    const queue = client.queues.get(message.guild.id); // Create a instance queue

    if (!queue) return message.reply('Não há nenhumaa música sendo tocada!'); // Verify if a queue exist

    message.delete(); // Delete the user command

    queue.connection.dispatcher.pause(); // Pause the song

    const songPaused = new MessageEmbed()
        .setAuthor('MÚSICA PAUSADA! ⏸️ ')
        .setColor('#FF8C00')
        .addField('Por:', message.member)
        .setDescription('Digite `!resume` para retomar.');
    return message.channel.send(songPaused);
};
module.exports = {
    name: "pause",
    description: "Pause the current playing song",
    execute,
};