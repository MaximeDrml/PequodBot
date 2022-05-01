import { GuildMember } from "discord.js"

/**
 * Return the guild nickname if there's one, else return the username
 * @param {Discord.GuildMember} member
 */
export const getMemberName = function (member: GuildMember) {
	let name
	if (member.nickname) {
		name = member.nickname
	} else {
		name = member.user.username
	}
	return name
}