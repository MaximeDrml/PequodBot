import { Client, Intents } from "discord.js"
import * as  music from "./music/music"
import "dotenv/config"

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES ] })

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag} ! Currently on ${client.guilds.cache.size} guilds !`)
})

client.on("guildCreate", (guild) => {
	console.log(`Joined the guild ${guild.name} !`)
})

client.on("guildDelete", (guild) => {
	console.log(`Left the guild ${guild.name} !`)
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) {return}

	switch (interaction.commandName) {
	case "ping":
		interaction.reply("Pong!")
		break

	case "help":
		interaction.reply("Help ! (TODO)")
		break

	case "play":
		music.handlePlayCommand(interaction)
		break

	case "pause":
		music.pause(interaction.guildId)
		break

	case "resume":
		music.resume(interaction.guildId)
		break

	case "leave":
		music.leaveChannel(interaction)
		break
	}
})

client.login(process.env.DISCORD_TOKEN)