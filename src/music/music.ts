import { AudioPlayerPlayingState, AudioPlayerStatus, createAudioResource, DiscordGatewayAdapterCreator, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice"
import { CommandInteraction, GuildMember, VoiceChannel } from "discord.js"
import ytdl from "ytdl-core"
import Player from "./Player"
import Track from "./Track"
import { VoiceChannelJoinError } from "../types/Errors"
import ytpl from "ytpl"

const players: Map<string, Player> = new Map()

export async function handlePlayCommand(interaction: CommandInteraction) {

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

	const query = interaction.options.get("query").value as string
	
	if (query === null) {
		resume(interaction.guildId)
		interaction.reply("Done !")
		return interaction.deleteReply()
	}

	await addTrack(query, requester, interaction)

	if (players.get(interaction.guildId).audioPlayer.state.status !== AudioPlayerStatus.Playing) {
		startPlaying(interaction.guildId)
	}
}

async function addTrack(query: string, requester: GuildMember, interaction: CommandInteraction) {
	const player = players.get(requester.guild.id)

	// Query is a YT URL
	if (/^(http(s)??:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/.test(query)) {
		const track = new Track(requester)
		await track.createFromUrl(query).then( (track) => {
			player.addTrackToQueue(track, false)
			interaction.followUp({ embeds: [ player.queue[0].getEmbed("a ajouté") ] })
		})
	// Query is a YT playlist
	} else if (/^.*(youtu.be\/|list=)([^#&?]*).*/.test(query)) {
		await ytpl(query).then((playlist) => {
			playlist.items.map(item => {
				const track = new Track(requester)
				track.createFromPlaylistItem(item)
				player.addTrackToQueue(track, false)
			})
			// interaction.followUp({ embeds: [ player.queue[0].getEmbed("a ajouté") ] })
		})
	// Query is a search query
	} else {
		const track = new Track(requester)
		await track.createFromSearch(query).then( (track) => {
			player.addTrackToQueue(track, false)
			interaction.followUp({ embeds: [ player.queue[0].getEmbed("a ajouté") ] })
		})
	}
}

function joinChannel(channel: VoiceChannel) {

	const existingConnection = getVoiceConnection(channel.guildId)

	if (existingConnection && existingConnection.joinConfig.channelId === channel.id) {
		return
	}

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

	if (!existingConnection) {
		players.set(channel.guildId, new Player())
	}

	connection.on(VoiceConnectionStatus.Signalling, () => {
		console.log(`Trying to join a channel on guild ${connection.joinConfig.guildId}...`)
	})

	connection.on(VoiceConnectionStatus.Ready, () => {
		console.log("Joined a channel on guild !")
	})

	connection.on(VoiceConnectionStatus.Destroyed, () => {
		console.log(`Left channel on guild ${connection.joinConfig.guildId} !`)
		players.delete(connection.joinConfig.guildId)
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
}

export function resume(guildId: string){
	const audioPlayer = players.get(guildId)
	if (audioPlayer) {
		players.get(guildId).audioPlayer.unpause()
	}
}

export function pause(guildId: string){
	const audioPlayer = players.get(guildId)
	if (audioPlayer) {
		players.get(guildId).audioPlayer.pause()
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