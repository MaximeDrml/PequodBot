import { AudioPlayer, VoiceConnection } from "@discordjs/voice"
import Track from "./Track"

export default class Player {
	queue: Track[]
	repeat: boolean
	loop: boolean
	connection: VoiceConnection
	audioPlayer: AudioPlayer

	constructor() {
		this.queue = []
		this.repeat = false
		this.loop = false
		this.audioPlayer = new AudioPlayer()
	}

	addTrackToQueue (track: Track, skip: boolean) {
		if (skip) {
			this.queue.splice(1,0, track)
		} else {
			this.queue.push(track)
		}
	}

	/**
     * Change the repeat state
     */
	toggleRepeat () {
		this.repeat = !this.repeat
	}

	/**
     * Change the loop state
     */
	toggleLoop () {
		this.loop = !this.loop
	}

}