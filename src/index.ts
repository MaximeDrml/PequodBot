import { Client, Intents, MessageEmbed } from "discord.js"
import * as  music from "./music/music"
import * as feur from "./utils/feur"
import "dotenv/config"
import * as db from "./utils/db"

db.initDB()

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES ] })

client.on("ready", async () => {
	console.log(`Logged in as ${client.user.tag} ! Currently on ${client.guilds.cache.size} guilds !`)
})

client.on("guildCreate", (guild) => {
	console.log(`Joined the guild ${guild.name} !`)
})

client.on("guildDelete", (guild) => {
	console.log(`Left the guild ${guild.name} !`)
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) { return }

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

client.on("messageCreate", async message => {
	if (message.author.bot || message.system) {return}

	if (message.content.trim() === `<@${client.user.id}>`) {
		const score = feur.getScore(message.member)
		const embed = new MessageEmbed()
			.setTitle(`Je t'ai dit "feur" ${score} fois !`)
			// .setDescription(`Date du dernier reset : ${resetDate.toLocaleString("fr-FR")}`)
		message.channel.send({ embeds: [ embed ] })
		return
	}

	if (/(quoi|koi|quoa|koa|cauha|kwa|qwa|coi)\W*$/gmi.test(message.content)) {
		// Get random custom emoji from the guild
		const emojisCollection = await message.guild.emojis.fetch()
		const randomEmoji = emojisCollection.random()
		const emoji = randomEmoji ? ` <:${randomEmoji.name}:${randomEmoji.id}>` : ""

		message.channel.send(`feur${emoji}`)
		feur.incrementScore(message.member)
	}
})

client.login(process.env.DISCORD_TOKEN)