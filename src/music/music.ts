import { createAudioResource, DiscordGatewayAdapterCreator, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice"
import { CommandInteraction, GuildMember, VoiceChannel } from "discord.js"
import ytdl from "ytdl-core"
import Player from "./Player"
import Track from "./Track"
import { VoiceChannelJoinError } from "../types/Errors"

const players: Map<string, Player> = new Map()

export function handlePlayCommand(interaction: CommandInteraction) {

	const requester = interaction.member as GuildMember

	try {
		joinChannel(requester.voice?.channel as VoiceChannel)
	} catch (error) {
		if (error instanceof VoiceChannelJoinError) {
			return interaction.reply(error.response)
		} else {
			console.error(error)
		}
	}

	interaction.reply("Voice channel joined !")
	interaction.deleteReply()

	const player = players.get(interaction.guildId)

	const query = interaction.options.get("query").value as string
	
	if (query === null) {
		//TODO Resume if paused
	}

	//TODO if the query is a YT URL
	if (query) {
		const track = new Track(requester)
		track.createFromUrl(query).then( (track) => {
			player.addTrackToQueue(track, false)
			startPlaying(interaction.guildId)
			interaction.followUp({ embeds: [ player.queue[0].getEmbed("a ajouté") ] })
		})
	}
}

function startPlaying(guildId: string) {
	const player = players.get(guildId)
	const stream = createAudioResource(ytdl(player.queue[0].url, { filter: "audioonly" }))
	player.audioPlayer.play(stream)
	getVoiceConnection(guildId).subscribe(player.audioPlayer)
}

export function leaveChannel(interaction: CommandInteraction) {
	getVoiceConnection(interaction.guildId).destroy()
	interaction.reply("Voice channel left !")
	interaction.deleteReply()
}

function joinChannel(channel: VoiceChannel) {

	if (channel === null) {
		throw new VoiceChannelJoinError("You are not in a accessible voice channel !") 
	} else if (!channel.joinable || channel.type !== "GUILD_VOICE") {
		throw new VoiceChannelJoinError("I can't join your voice channel !")
	}

	const connection = joinVoiceChannel({
		guildId: channel.guildId,
		channelId: channel.id,
		adapterCreator: channel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator
	})

	players.set(channel.guildId, new Player())

	connection.on(VoiceConnectionStatus.Signalling, () => {
		console.log(`Trying to join a channel on guild ${connection.joinConfig.guildId}...`)
	})

	connection.on(VoiceConnectionStatus.Ready, () => {
		console.log("Joinded a channel on guild !")
	})

	connection.on(VoiceConnectionStatus.Disconnected, async () => {
		// Workaround found on discord.js doc to handle manual moving
		try {
			await Promise.race([
				entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
				entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
			])
			// Seems to be reconnecting to a new channel - ignore disconnect
		} catch (error) {
			// Seems to be a real disconnect which SHOULDN'T be recovered from
			connection.destroy()
		}
	})

	connection.on(VoiceConnectionStatus.Destroyed, () => {
		console.log(`Left channel on guild ${connection.joinConfig.guildId} !`)
		players.delete(connection.joinConfig.guildId)
	})
}
