/* eslint-disable no-inline-comments */
/* eslint-disable no-unreachable */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-inner-declarations */
const { MessageEmbed } = require('discord.js');
const { search } = require('yt-search');
const yts = require('yt-search');
const ytdl = require('ytdl-core-discord');
let playing;
const execute = async (client, message, args) => {
    try {
        // Verifying if the user is connected to a voice channel
        if (!message.member.voice.channel) return message.reply('você precisar estar em um canal do voz.');

        // Searching for URL on YouTube
        const songRequested = args.join(' '); // Taking the song's name/URL from command
        let songUrl; // Creating a variable to receive the song's URL
        const result = await yts(songRequested); // Searching for the song's name/URL
        const videos = result.videos.slice(0, 1); // Taking only the first video from response and adding into a array
        videos.forEach(function(video) {
            // message.reply(`${video.url}`); // Replying in chat the song's URL
            return songUrl = video.url, songTitle = video.title, songThumb = video.thumbnail, songDuration = video.timestamp, songViews = video.views, songAgo = video.ago; // Assign the song's URL to a variable
        });
        const queue = client.queues.get(message.guild.id);
        if (queue) { // If a queue already exists
            console.log('ENTREI NA LINHA 27');
            queue.songs.push(songUrl); // push the new typed song on the queue
            client.queues.set(message.guild.id, queue);
        } else {
            console.log('entrei na linha 31');
            playSong(client, message, songUrl); // If not exists a queue, the playSong function is called
            let messageBanner = new MessageEmbed()
                .setAuthor('TOCANDO AGORA! 🔊', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuulkKdCSVtNZ60bIRYRuOqv2452Gpo1Qtxg&usqp=CAU')
                .setThumbnail(songThumb)
                .setColor('YELLOW')
                .addField('Nome:', songTitle)
                .addField('Duração:', songDuration, true)
                .addField('Pedida por:', message.member, true)
                .setFooter(`${songViews} visualizações | ${songAgo}`);
            return message.channel.send(messageBanner);
        }
    } catch (e) {
        console.log(e);
    }
};

const playSong = async (client, message, songUrl) => {
    let queue = client.queues.get(message.member.guild.id);
    if (!queue) {
        console.log('ENTREEI NA LINHA 41!');
        const conn = await message.member.voice.channel.join();
        queue = {
            volume: 10,
            connection: conn,
            dispatcher: null,
            songs: [songUrl],
        };
    }
    queue.dispatcher = await queue.connection.play(await ytdl(songUrl), { highWaterMark: 1 << 25, type: 'opus' });
    queue.dispatcher.on('finish', () => {
        console.log(`before shift -> ${queue.songs}`);
        queue.songs.shift(); // Removing the first elements from queue(array)
        console.log(`after shift -> ${queue.songs}`);
        console.log('playing new song from queue');
        if (queue.songs[0]) {
            console.log('ENTREI NA LINHA 59');
            playSong(client, message, queue.songs[0]); // Playing the first song from queue
        } else {
            console.log('ENTREI NA LINHA 62');
            return client.queues.delete(message.member.guild.id); // As has no song on queue, it's deleted
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