module.exports = {
    name: 'play',
    description: 'Play a music by the user\'s choice',
    args: true,
    execute(message, args) {
        message.channel.send('playing!');
    },
};