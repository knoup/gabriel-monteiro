const { MessageEmbed } = require('discord.js');
const execute = (client, message) => {
    const queue = client.queues.get(message.guild.id); // Getting current queue

    if (!queue) return message.reply('não há nenhuma música sendo tocada!'); // Verify if a queue exist

    message.delete(); // Delete the user command
    
    if (!queue.playing) return message.reply('uma música já está pausada.'); // Verify if a song is playing

    // Verifying if the last message has a title specific
    if (client.user.lastMessage.embeds[0].title !== 'TOCANDO AGORA! 🔊') {
        client.user.lastMessage.delete();
    }

    queue.connection.dispatcher.pause(); // Pause the song

    queue.playing = false; // changing playing state

    const songPaused = new MessageEmbed()
        .setTitle('MÚSICA PAUSADA! ⏸️ ')
        .setColor('#FF8C00')
        .setDescription('Digite `!resume` para retomar');
    return message.channel.send(songPaused);
};
module.exports = {
    name: "pause",
    description: "Pause the current playing song",
    execute,
};