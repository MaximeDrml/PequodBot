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

	if (interaction.commandName === "ping") {
		await interaction.reply("Pong!")
	}

	if (interaction.commandName === "help") {
		await interaction.reply("Pong!")
	}

	if (interaction.commandName === "play") {
		music.handlePlayCommand(interaction)
	}

	if (interaction.commandName === "leave") {
		music.leaveChannel(interaction)
	}
})

client.login(process.env.DISCORD_TOKEN)