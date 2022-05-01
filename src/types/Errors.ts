export class VoiceChannelJoinError extends Error {
	constructor(response) {
		super()
		this.response = response
		throw new Error("ERROR WHILE JOINING")
	}
	response: string
}