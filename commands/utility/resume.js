const { MessageEmbed } = require('discord.js');
const execute = (client, message) => {
    const queue = client.queues.get(message.guild.id); // Getting current queue

    if (queue && !queue.playing){
        try {
            queue.connection.dispatcher.resume(); // Resume the current paused song

            queue.playing = true; // changing playing state

            message.channel.bulkDelete(10); // Deleting the 10 last messages to avoid spam 

            const resumed = new MessageEmbed()
                .setTitle('MÚSICA RETOMADA! ▶️')
                .setColor('GREEN')
                .setDescription(`Por: ${message.member}`);

            const nowPlaying = new MessageEmbed()
                .setTitle('TOCANDO AGORA! 🔊')
                .setThumbnail(queue.songs[0].image)
                .setColor('BLUE')
                .addField('Nome:', queue.songs[0].title)
                .addField('Duração:', queue.songs[0].timestamp, true)
                .addField('Pedida por:', message.member, true)
                .setFooter(`${queue.songs[0].views} visualizações | ${queue.songs[0].ago}`);
            return message.channel.send(resumed), message.channel.send(nowPlaying); // Sending the embed messages
        } catch (error) {
            console.log(error);
        }
    } else {
        message.delete(); // Deleting the command sent
        return message.reply(' nenhuma música está está pausada!');
    }
};
module.exports = {
    name: "resume",
    description: "Resume the current paused song",
    execute,
};