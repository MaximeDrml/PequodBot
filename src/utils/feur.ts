import { GuildMember } from "discord.js"
import { db } from "./db"

export function incrementScore(member: GuildMember) {
	const score = getScore(member)
	const update = db.prepare("UPDATE member SET quoiNb = ?")
	update.run(score+1)
}

export function getScore(member: GuildMember) {
	const memberScore = db.prepare(`SELECT quoiNb FROM member WHERE id = '${member.id}'`).get()

	if (memberScore instanceof Error) {
		console.error("error")
		return 0
	}
	else if (memberScore === undefined) {
		const insert = db.prepare("INSERT INTO member VALUES (?, ?)")
		insert.run(member.id, 0)
		return 0
	} else {
		return memberScore.quoiNb
	}

}