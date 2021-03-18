/* eslint-disable no-inline-comments */
const playSong = require('./play.js').playSong;
const { MessageEmbed } = require('discord.js');

const execute = async (client, message) => {
    try {
        // Verifying if the user is connected to a voice channel
        if (!message.member.voice.channel) return message.reply('você precisar estar em um canal do voz.');

        const queue = client.queues.get(message.guild.id); // Getting current queue

        if (!queue) return message.reply('Nenhuma música está tocando.'); // Verifying if a song is playing

        queue.songs.shift(); // Removing the first elements from queue(array)
        if (queue.songs[0]) {
            const skiped = new MessageEmbed()
                .setTitle('MÚSICA SKIPADA! ⏩')
                .setColor('RED')
                .setDescription(`Por: ${message.member}`);
            message.channel.send(skiped);

            message.channel.bulkDelete(10); // Deleting the last 10 messages from channel

            client.queues.set(message.guild.id, queue); // Updating queue

            client.user.setActivity(`${queue.songs[0].title}`, { type: 'LISTENING' }); // Setting the song name from status bot

            playSong(client, message, queue.songs[0]); // Playing the new queue's first song 

            const nowPlaying = new MessageEmbed()
                .setTitle('TOCANDO AGORA! 🔊')
                .setThumbnail(queue.songs[0].image)
                .setColor('BLUE')
                .addField('Nome:', queue.songs[0].title)
                .addField('Duração:', queue.songs[0].timestamp, true)
                .addField('Pedida por:', message.member, true)
                .setFooter(`${queue.songs[0].views} visualizações | ${queue.songs[0].ago}`);
            return message.channel.send(nowPlaying);
        } else {
            message.channel.bulkDelete(10); // Deleting the 10 last messages from channel

            message.member.voice.channel.leave(); // Leaving the voice channel

            const nothingPlaying = new MessageEmbed()
                .setTitle('FILA VAZIA! 🔇')
                .setColor('RED')
                .setDescription('Digite `!play <nome/link>` para tocar uma música.');
            client.user.setActivity('a esquerda chorar.', { type: 'LISTENING' }); // Setting the song name from status bot
            return message.channel.send(nothingPlaying), client.queues.delete(message.member.guild.id);
        }
    } catch (error) {
        console.log(error);
    }
};
module.exports = {
    name: 'skip',
    description: 'Skip the current playing music',
    args: false,
    execute,
};