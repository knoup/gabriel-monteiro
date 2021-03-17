/* eslint-disable no-inline-comments */
/* eslint-disable no-unreachable */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-inner-declarations */
const { MessageEmbed, WebhookClient, DiscordAPIError, Discord, MessageCollector } = require('discord.js');
const { search } = require('yt-search');
const yts = require('yt-search');
const ytdl = require('ytdl-core-discord');
let playing;
const execute = async (client, message, args) => {
    try {
        // Verifying if the user is connected to a voice channel
        if (!message.member.voice.channel) return message.reply('você precisar estar em um canal do voz.');

        //
        // const botUser = new Discord.User();

        // Searching for URL on YouTube
        const songRequested = args.join(' '); // Taking the song's name/URL from command
        // let songUrl; // Creating a variable to receive the song's URL
        const result = await yts(songRequested); // Searching for the song's name/URL
        const videos = result.videos.slice(0, 1); // Taking only the first video from response and adding into a array
        const video = videos[0];
        // videos.forEach(function(video) {
        //     // message.reply(`${video.url}`); // Replying in chat the song's URL
        //     return video;
        //     // return songUrl = video.url, video.title = video.title, video.image = video.image, video.duration = video.timestamp, video.views = video.views, video.ago = video.ago; // Assign the song's URL to a variable
        // });
        const queue = client.queues.get(message.guild.id);
        if (queue) { // If a queue already exists
            queue.songs.push(video); // push the new typed song on the queue
            client.queues.set(message.guild.id, queue);
            if (!client.user.lastMessage.embeds[0].title === 'TOCANDO AGORA! 🔊') {
                client.user.lastMessage.delete();
            }
            message.delete();
            const songAdded = new MessageEmbed()
                .setAuthor('MÚSICA ADICIONADA À FILA! ✅', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuulkKdCSVtNZ60bIRYRuOqv2452Gpo1Qtxg&usqp=CAU')
                .setThumbnail(video.image)
                .setColor('GREEN')
                .addField('Nome:', video.title)
                .addField('Duração:', video.duration, true)
                .addField('Pedida por:', message.member, true)
                .setFooter(`${video.views} visualizações | ${video.ago}`);
            return message.channel.send(songAdded);
        } else {
            try {
                if (client.user.lastMessage) client.user.lastMessage.delete();
                message.channel.bulkDelete(10);
                playSong(client, message, video); // If not exists a queue, the playSong function is called
                client.user.setActivity(`${video.title}`, { type: 'LISTENING' });
                const messageBanner = new MessageEmbed()
                    .setAuthor('', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuulkKdCSVtNZ60bIRYRuOqv2452Gpo1Qtxg&usqp=CAU')
                    .setTitle('TOCANDO AGORA! 🔊')
                    .setThumbnail(video.image)
                    .setColor('YELLOW')
                    .addField('Nome:', video.title)
                    .addField('Duração:', video.duration, true)
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
        const conn = await message.member.voice.channel.join();
        queue = {
            volume: 10,
            connection: conn,
            dispatcher: null,
            songs: [video],
        };
    }
    queue.dispatcher = await queue.connection.play(await ytdl(video.url), { highWaterMark: 1 << 25, type: 'opus', filter: 'audioonly', quality: 'highestaudio' });
    queue.dispatcher.on('finish', () => { // When the music is finish
        queue.songs.shift(); // Removing the first elements from queue(array)
        if (queue.songs[0]) { // Verifying if has song on queue
            // message.delete();
            message.channel.bulkDelete(10); // Deleting the last message from bot
            playSong(client, message, queue.songs[0]); // Playing the first song from queue
            client.user.setActivity(`${queue.songs[0].title}`, { type: 'LISTENING' });
            const nowPlaying = new MessageEmbed()
                .setAuthor('', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuulkKdCSVtNZ60bIRYRuOqv2452Gpo1Qtxg&usqp=CAU')
                .setTitle('TOCANDO AGORA! 🔊')
                .setThumbnail(queue.songs[0].image)
                .setColor('BLUE')
                .addField('Nome:', queue.songs[0].title)
                .addField('Duração:', queue.songs[0].duration, true)
                .addField('Pedida por:', message.member, true)
                .setFooter(`${queue.songs[0].views} visualizações | ${queue.songs[0].ago}`);
            return message.channel.send(nowPlaying);
        } else {
            client.user.lastMessage.delete();
            console.log(client.user.lastMessage.embeds[0].title);
            message.member.voice.channel.leave();
            const nothingPlaying = new MessageEmbed()
                .setAuthor('FILA VAZIA! 🔇', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuulkKdCSVtNZ60bIRYRuOqv2452Gpo1Qtxg&usqp=CAU')
                .setColor('RED');
            client.user.setActivity('a esquerda chorar.', { type: 'LISTENING' });
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