const { MessageEmbed, WebhookClient, DiscordAPIError, Discord, MessageCollector } = require('discord.js');
const { search } = require('yt-search');
const yts = require('yt-search');
const ytdl = require('ytdl-core-discord');
const execute = async (client, message, args) => {
    try {
        // Verifying if the user is connected to a voice channel
        if (!message.member.voice.channel) return message.reply('você precisar estar em um canal do voz.');

        // Searching for URL on YouTube
        const songRequested = args.join(' '); // Taking the song's name/URL from command
        // let songUrl; // Creating a variable to receive the song's URL
        const result = await yts(songRequested); // Searching for the song's name/URL
        const videos = result.videos.slice(0, 1); // Taking only the first video from response and adding into a array
        const video = videos[0];
        const queue = client.queues.get(message.guild.id);

        // If a queue already exists
        if (queue) {
            queue.songs.push(video); // push the new typed song on the queue
            client.queues.set(message.guild.id, queue); // Using a queue from that server

            // Verifying if the last message has a title specific
            if (client.user.lastMessage.embeds[0].title !== 'TOCANDO AGORA! 🔊') {
                client.user.lastMessage.delete();
            }

            message.delete(); // Deleting the last user message

            const songAdded = new MessageEmbed()
                .setAuthor('MÚSICA ADICIONADA À FILA! ✅', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuulkKdCSVtNZ60bIRYRuOqv2452Gpo1Qtxg&usqp=CAU')
                .setThumbnail(video.image)
                .setColor('GREEN')
                .addField('Nome:', video.title)
                .addField('Duração:', video.timestamp, true)
                .addField('Pedida por:', message.member, true)
                .setFooter(`${video.views} visualizações | ${video.ago}`);
            return message.channel.send(songAdded);

        } else {
            try {
                if (client.user.lastMessage) client.user.lastMessage.delete(); // Verifying if the client sent a message before that session

                message.channel.bulkDelete(10); // Deleting the last 10 messages to cluan up the channel

                playSong(client, message, video); // If not exists a queue, the playSong function is called

                client.user.setActivity(`${video.title}`, { type: 'LISTENING' }); // Setting the song name from status bot
                const messageBanner = new MessageEmbed()
                    .setAuthor('', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuulkKdCSVtNZ60bIRYRuOqv2452Gpo1Qtxg&usqp=CAU')
                    .setTitle('TOCANDO AGORA! 🔊')
                    .setThumbnail(video.image)
                    .setColor('YELLOW')
                    .addField('Nome:', video.title)
                    .addField('Duração:', video.timestamp, true)
                    .addField('Pedida por:', message.member, true)
                    .setFooter(`${video.views} visualizações | ${video.ago}`);
                return message.channel.send(messageBanner);
            } catch {
                console.log('error!');
            }
        }
    } catch (e) {
        console.log(e);
    }
};

const playSong = async (client, message, video) => {
    let queue = client.queues.get(message.member.guild.id);
    if (!queue) { // If has no queue, create one
        const conn = await message.member.voice.channel.join(); // Joining the voice channel
        queue = {
            volume: 10,
            connection: conn,
            dispatcher: null,
            songs: [video],
            playing: true,
        };
    }
    queue.dispatcher = await queue.connection.play(await ytdl(video.url), { highWaterMark: 1 << 25, type: 'opus', filter: 'audioonly', quality: 'highestaudio' }); // Playing the song

    // When the music is finish
    queue.dispatcher.on('finish', () => {
        queue.songs.shift(); // Removing the first elements from queue(array)

        // Verifying if has song on queue
        if (queue.songs[0]) {
            message.channel.bulkDelete(10); // Deleting the last message from bot

            playSong(client, message, queue.songs[0]); // Playing the first song from queue

            client.user.setActivity(`${queue.songs[0].title}`, { type: 'LISTENING' }); // Setting the song name from status bot

            const nowPlaying = new MessageEmbed()
                .setAuthor('', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuulkKdCSVtNZ60bIRYRuOqv2452Gpo1Qtxg&usqp=CAU')
                .setTitle('TOCANDO AGORA! 🔊')
                .setThumbnail(queue.songs[0].image)
                .setColor('BLUE')
                .addField('Nome:', queue.songs[0].title)
                .addField('Duração:', queue.songs[0].timestamp, true)
                .addField('Pedida por:', message.member, true)
                .setFooter(`${queue.songs[0].views} visualizações | ${queue.songs[0].ago}`);
            return message.channel.send(nowPlaying);

        } else {
            message.channel.bulkDelete(10); // Deleting the last message from bot

            message.member.voice.channel.leave(); // Leaving the voice channel

            const nothingPlaying = new MessageEmbed()
                .setAuthor('FILA VAZIA! 🔇', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuulkKdCSVtNZ60bIRYRuOqv2452Gpo1Qtxg&usqp=CAU')
                .setColor('RED');
            client.user.setActivity('a esquerda chorar.', { type: 'LISTENING' }); // Setting the song name from status bot
            return message.channel.send(nothingPlaying), client.queues.delete(message.member.guild.id);
        }
    });
    client.queues.set(message.member.guild.id, queue);
};
module.exports = {
    name: 'play',
    description: 'Play a music by the user\'s choice',
    args: true,
    execute,
    playSong,
};