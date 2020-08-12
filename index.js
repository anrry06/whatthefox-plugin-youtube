const ytdl = require("ytdl-core");

const Plugin = {
    name: "youtube",
    event: "message",
    commands: [
        {
            command: "play",
            doc: {
                embed: {
                    fields: [
                        {
                            name: "Usage",
                            value: "!play <youtube_url>",
                        },
                        {
                            name: "Description",
                            value: "Play the audio from a youtube video",
                        },
                    ],
                },
            },
            action: async function (router, next) {
                let url = router.args[0];
                let that = this;

                const voiceChannel = router.message.member.voice.channel;
                if (!voiceChannel) {
                    router.answer =
                        "You need to be in a voice channel to play music!";
                    return next();
                }

                const permissions = voiceChannel.permissionsFor(
                    router.message.client.user
                );
                if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                    router.answer =
                        "I need the permissions to join and speak in your voice channel!";
                    return next();
                }

                const songInfo = await ytdl.getInfo(url);
                const song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                };

                try {
                    router.connection = await voiceChannel.join();
                    router.dispatcher = router.connection
                        .play(ytdl(song.url))
                        .on('finish', () => {
                            console.log('finish youtube')
                        })
                        .on("error", (error) => console.error(error));

                    router.dispatcher.setVolumeLogarithmic(0.2);

                    router.answer = `Start playing: **${song.title}**`;
                    next();
                } catch (err) {
                    console.log(err);
                    router.answer = `Error: ${err}`;
                    return next();
                }
            },
        },
        {
            command: "stop",
            doc: {
                embed: {
                    fields: [
                        {
                            name: "Usage",
                            value: "!stop",
                        },
                        {
                            name: "Description",
                            value: "Stop the current audio youtube playing",
                        },
                    ],
                },
            },
            action: function (router, next) {
                if (!router.message.member.voice.channel)
                    return (router.answer =
                        "You have to be in a voice channel to stop the music!");

                router.dispatcher.end();
                router.answer = "Stop playing";
                next();
            },
        },
    ],
};

module.exports = Plugin;
