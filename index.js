const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const express = require("express");

// Express server for hosting services (keeps bot alive)
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(3000, () => console.log("🌐 Web server started"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const distube = new DisTube(client, {
  searchSongs: 0,
  emitNewSongOnly: true,
  leaveOnFinish: true,
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.split(" ");
  const command = args.shift().toLowerCase();

  if (command === "!play") {
    if (!message.member.voice.channel) {
      return message.reply("❌ You must be in a voice channel!");
    }
    if (!args[0]) return message.reply("❌ Provide a song name or URL.");
    distube.play(message.member.voice.channel, args.join(" "), {
      member: message.member,
      textChannel: message.channel,
      message,
    });
  }

  if (command === "!stop") {
    distube.stop(message);
    message.channel.send("⏹️ Music stopped!");
  }

  if (command === "!skip") {
    distube.skip(message);
    message.channel.send("⏭️ Skipped!");
  }
});

// Song events
distube
  .on("playSong", (queue, song) =>
    queue.textChannel.send(
      `🎶 Now playing: \`${song.name}\` - \`${song.formattedDuration}\``
    )
  )
  .on("addSong", (queue, song) =>
    queue.textChannel.send(`➕ Added: ${song.name}`)
  );

client.login("MTEwNDMzNDIyNjMwMTY1NzE1OQ.GDK71J.gXorO5CHDumDejOzEh_tduBuufdNmJXL1lMZPQ");
