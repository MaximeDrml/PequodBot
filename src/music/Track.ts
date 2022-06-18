import { GuildMember, MessageEmbed } from "discord.js"
import { getMemberName } from "../utils/utils"
import "ytsr"
import ytdl from "ytdl-core"
import ytsr, { Video } from "ytsr"
import { Item } from "ytpl"

export default class Track {
	requester: GuildMember
	title: string
	thumbnail: string
	duration: string
	url: string
	channelName: string
	channelUrl: string

	/**
     * Creates a YtSong object from a query. If the query is a Youtube url, creates a song from it. Else, search the query via YT API and creates a song from the first result.
     * @see YtSong.init to initialize the object
     * @param {GuildMember} requestMember - The guild memeber that requested the song
     */
	constructor(requester: GuildMember) {
		this.requester = requester
	}

	/**
     * @param {String} url - The url of the file to play
     */
	initFromFile (url: string) {
		switch (url) {
		case "soutien.ogg":
			this.title = "DU SOUTIEN"
			this.thumbnail = "https://static.wikia.nocookie.net/metalgear/images/5/53/V_vi_acc.png/revision/latest?cb=20160806163242"
			this.duration = "2m30s"
			break
  
		default:
			break
		}
		this.url = "ressources/audio/" + url
	}

	/**
     * Uses the Youtube API to create a song object from it
     * @param {String} url - The url of the song
     * @throws Throws can error if there's an error in the Youtube API query
     */
	async createFromUrl (url: string) {
		await ytdl.getInfo(url)
			.then((data) => {
				this.thumbnail = data.thumbnail_url
				this.title = data.videoDetails.title
				this.channelName = data.videoDetails.author.name
				this.channelUrl = data.videoDetails.author.user_url
				this.duration = data.videoDetails.lengthSeconds
				this.url = data.videoDetails.video_url
			})
			.catch((reason) => {
				console.error(reason)
			})
		return this
	}		

  
	/**
		 * Uses the Youtube API to search for a song, then create an object
		 * @param {String} query - The search query
		 * @throws Throws can error if there's an error in the Youtube API query
		 */
	async createFromSearch (query: string) {
		const filters1 = await ytsr.getFilters(query)
		const filter1 = filters1.get("Type").get("Video")
		await ytsr(filter1.url, { limit: 1, })
			.then((result) => {
				const data = result.items[0] as Video
				this.thumbnail = data.bestThumbnail.url
				this.title = data.title
				this.channelName = data.author.name
				this.channelUrl = data.author.url
				this.duration = data.duration
				this.url = data.url
			})
			.catch((error) => console.error(error))
		return this
	}

	createFromPlaylistItem (item: Item) {
		this.thumbnail = item.bestThumbnail.url
		this.title = item.title
		this.channelName = item.author.name
		this.channelUrl = item.author.url
		this.duration = item.duration
		this.url = item.url
	}



	/**
     *
     * @param {String} text - The text to display
     */
	getEmbed (text: string) {
		const embed = new MessageEmbed()
			.setTitle(this.title)
			.setColor(15338793)
			.setAuthor({
				name: getMemberName(this.requester) + " " + text,
				iconURL: this.requester.user.avatarURL()
			})
		if (this.channelName && this.channelUrl) {
			embed.addField("Chaîne :", "[" + this.channelName + "](" + this.channelUrl + ")", true)
		}
		if (this.thumbnail) {
			embed.setThumbnail(this.thumbnail)
		}
		return embed
	}
}