import { AudioPlayer, AudioPlayerStatus, createAudioResource } from "@discordjs/voice"
import ytdl from "ytdl-core"
import Track from "./Track"

export default class Player {
	queue: Track[]
	repeat: boolean
	loop: boolean
	audioPlayer: AudioPlayer

	constructor() {
		this.queue = []
		this.repeat = false
		this.loop = false
		this.audioPlayer = new AudioPlayer()

		this.audioPlayer.on("error", error => {
			console.error(error)
		})
		
		this.audioPlayer.on(AudioPlayerStatus.Idle, function goToNextTrack() {
			this.setNextTrack(false)
			if (this.queue.length > 0) {
				try {
					const stream = ytdl(this.queue[0].url, { filter: "audioonly" })
					const ressource = createAudioResource(stream)
					this.audioPlayer.play(ressource)
				} catch (error) {
					console.error(error)
					goToNextTrack()
				}
			} else {
				this.audioPlayer.playable.map(connection => connection.destroy())
				this.audioPlayer.stop()
			}
		})
	}

	setNextTrack(forceSkip: boolean) {
		//No repeat or force skip, go to next song
		if (!this.repeat || forceSkip) {
			const currentTrack = this.queue.shift()
			if (this.loop) {
				this.queue.push(currentTrack)
			}
		}
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