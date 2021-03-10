/* eslint-disable no-unreachable */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-inner-declarations */
const { search } = require('yt-search');
const yts = require('yt-search');
const ytdl = require('ytdl-core-discord');
const execute = async (client, message, args) => {
    try {
        // Verifying if the user is connected to a voice channel
        if (!message.member.voice.channel) return message.reply('você precisar estar em um canal do voz.');

        // Searching for URL on YouTube
        const songRequested = args.join(' ');
        let URLsong;
        const result = await yts(songRequested);
        const videos = result.videos.slice(0, 1);
        videos.forEach(function(video) {
            message.reply(`${video.url}`);
            return URLsong = video.url;
        });

        const queue = client.queues.get(message.guild.id);
        if (queue) {
            queue.songs.push(URLsong);
            client.queues.set(message.guild.id, queue);
        } else {
            playSong(client, message, URLsong);
        }
        // // Playing music
        // // eslint-disable-next-line no-shadow
        // async function playSong(connection, song) {
        //     connection.play(await ytdl(song), { type: 'opus', highWaterMark: 50 });
        // }
    } catch (e) {
        console.log(e);
    }
};

const playSong = async (client, message, URLsong) => {
    let queue = client.queues.get(message.member.guild.id);
    if (!queue) {
        const conn = await message.member.voice.channel.join();
        queue = {
            volume: 10,
            connection: conn,
            dispatcher: null,
            songs: [URLsong],
        };
    }
    queue.dispatcher = await queue.connection.play(await ytdl(URLsong), { type: 'opus', highWaterMark: 50, filter: 'audioonly' });
    queue.dispatcher.on('finish', () => {
        queue.songs.shift();
        playSong(client, message, queue.songs[0]);
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
