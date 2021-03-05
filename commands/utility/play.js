const yts = require('yt-search');
const ytdl = require('ytdl-core-discord');
module.exports = {
    name: 'play',
    description: 'Play a music by the user\'s choice',
    args: true,
    async execute(message, args) {
        if (!message.member.voice.channel) return message.reply('você precisar estar em um canal do voz.');

        // Searching for URL on YouTube
        const song = args.join(' ');
        const result = await yts(song);

        let URLsong;
        const videos = result.videos.slice(0, 1);
        videos.forEach(function(video) {
            message.reply(`${video.url}`);
            return URLsong = video.url;
        });

        // Join channel
        const connection = await message.member.voice.channel.join();

        // Playing music
        // eslint-disable-next-line no-shadow
        async function play(connection, url) {
            connection.play(await ytdl(url), { type: 'opus', highWaterMark: 50 });
        }

        play(connection, URLsong);

    },
};