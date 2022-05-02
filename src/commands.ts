import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import "dotenv/config"

const commands = [
	{
		name: "ping",
		description: "Replies with Pong!"
	},
	{
		name: "help",
		description: "Send a list of available commands"
	},
	{
		name: "play",
		description: "Play a song",
		options: [
			{
				name: "query",
				description: "A Youtube URL or search query",
				type: 3
			}
		]
	},
	{
		name: "leave",
		description: "Leave a channel"
	},
	{
		name: "pause",
		description: "Pause the music"
	}
] 

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		console.log("Started refreshing application (/) commands.")

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		)

		console.log("Successfully reloaded application (/) commands.")
	} catch (error) {
		console.error(error)
	}
})()