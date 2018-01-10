import 'babel-polyfill'
import discord from 'discord.js'
import fs from 'fs'
import path from 'path'

function loadJson (filePath) {
	return JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf8'))
}

function writeJson (filePath, data) {
	fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(data))
}

let CONFIG_PATH, DATA_PATH
if (process.env.NODE_ENV === 'production') {
	CONFIG_PATH = './config.json'
	DATA_PATH = './data.json'
} else {
	CONFIG_PATH = '../config.json'
	DATA_PATH = '../data.json'
}
const CONFIG = loadJson(CONFIG_PATH)

const BOT_NUMBER = 2
const PRODUCTION_PREFIX = '$'
const GUILD = 'Northside Nomic'

const VOTING_CHANNEL = 'voting'
const INTRODUCTION_CHANNEL = 'introductions'
const PROPOSAL_CHANNEL = 'current-proposal'
const ANNOUNCEMENT_CHANNEL = 'announcements'
const ARCHIVE_CHANNEL = 'archived-proposals'

const DEVELOPER_ROLE = 'react developer'
const YES = 'yes'
const NO = 'no'
const ADMIN_ROLE = 'gm'
const CURRENT_TURN_ROLE = 'my-turn'

function findRole (guild, name) {
	return guild.roles.find('name', name)
}

function memberRole (member, name) {
	return member.roles.find('name', name)
}

function findChannel (guild, name) {
	return guild.channels.find('name', name)
}

function sendChannel (guild, name, message) {
	return findChannel(guild, name).send(message)
}

function cleanChannel (guild, name) {
	return findChannel(guild, name).bulkDelete(999, true)
}

function totalMembers (guild) {
	return guild.memberCount - BOT_NUMBER
}

function membersNeeded (guild) {
	return Math.round(totalMembers(guild) / 2)
}

function calculateProposalQueue (client) {
	return client.guilds.find('name', GUILD).members
		.filter(member => !member.bot)
		.sort((a, b) => {
			return a.joinedTimestamp - b.joinedTimestamp
		})
		.map(member => member.id)
}

function currentTurnMember (guild) {
	return guild.members.filterArray(member => memberRole(member, CURRENT_TURN_ROLE))[0]
}

const data = loadJson(DATA_PATH)

function setData (name, value) {
	data[name] = value
	writeJson(data)
}

const client = new discord.Client()
let proposal_queue

function updateProposalQueue () {
	proposal_queue = calculateProposalQueue(client)
}

client.on('ready', async () => {
	updateProposalQueue()
})

client.on('message', async message => {
	if (message.author.bot) return
	if (message.content.indexOf(CONFIG.prefix) !== 0) return

	if (process.env.NODE_ENV !== 'production' && !memberRole(message.member, DEVELOPER_ROLE)) {
		message.channel.send(`I am a tester bot. Use the ${PRODUCTION_PREFIX} instead.`)
		return
	}

	if (!currentTurnMember(message.guild)) {
		message.channel.send(`Warning! No ${CURRENT_TURN_ROLE} role is set. **This must be fixed immediately >:(**.`)
		return
	}

	const args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/g)
	const command = args.shift().toLowerCase()
	const { member, channel, guild } = message
	const roles = {
		[YES]: findRole(guild, YES),
		[NO]: findRole(guild, NO),
		[CURRENT_TURN_ROLE]: findRole(guild, CURRENT_TURN_ROLE),
	}

	if (command === 'ping') {
		const m = await channel.send('Ping?')
		m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`)
	}

	else if (command === 'vote') {
		if (args[0] !== YES && args[0] !== NO) {
			channel.send(`You must vote '${YES}' or '${NO}'`)
			return
		}

		let yesVotes = args[0] === YES ? 1 : 0
		let noVotes = args[0] === NO ? 1 : 0
		const memberCountHalf = Math.round(totalMembers(guild) / 2)

		let end = false
		let difference
		for (let member2 of guild.members.array()) {
			if (member2.id !== member.id) {
				if (memberRole(member2, YES)) yesVotes += 1
				else if (memberRole(member2, NO)) noVotes += 1

				if (yesVotes >= memberCountHalf || noVotes > memberCountHalf) {
					if (yesVotes >= memberCountHalf) {
						sendChannel(guild, VOTING_CHANNEL, 'The proposal has been passed!')
						end = 'passed'
						difference = yesVotes - noVotes
					} else if (noVotes > memberCountHalf) {
						sendChannel(guild, VOTING_CHANNEL, 'The proposal has been rejected!')
						end = 'rejected'
						difference = noVotes - yesVotes
					}
					break
				}

			}
		}

		if (end) {
			for (let member2 of guild.members.array()) {
				member2.removeRole(roles[NO])
				member2.removeRole(roles[YES])
			}

			setData('cycleCount', data.cycleCount + 1)

			const previousTurnMember = currentTurnMember(guild)

			previousTurnMember.removeRole(roles[CURRENT_TURN_ROLE])
			const previousTurnI = proposal_queue.indexOf(previousTurnMember.id)

			let nextTurnI
			if (previousTurnI === proposal_queue.length) {
				sendChannel(guild, ANNOUNCEMENT_CHANNEL, `Cycle #${data.cycleCount} has begun!`)
				nextTurnI = 0
			} else {
				nextTurnI = previousTurnI + 1
			}
			const activeTurnMember = guild.members.find('id', proposal_queue[nextTurnI])
			activeTurnMember.addRole(roles[CURRENT_TURN_ROLE])

			const messages = findChannel(guild, PROPOSAL_CHANNEL).messages.array()
			sendChannel(guild, ARCHIVE_CHANNEL, `
**Action: ${messages.shift()}**
Sponsor: ${previousTurnMember.displayName}
Status: ${end} by ${difference} votes
__**Proposal Text**__
${messages.join('\n')}
			`)
			cleanChannel(guild, PROPOSAL_CHANNEL)
			sendChannel(guild, PROPOSAL_CHANNEL, `Submit official proposals here. It is currently ${activeTurnMember.displayName}'s turn.`)

		} else {
			member.addRole(roles[args[0]])
			// channel.send(`You have voted ${args[0]}`)

			if (args[0] === YES && memberRole(member, NO)) {
				member.removeRole(roles[NO])
			} else if (args[0] === NO && memberRole(member, YES)) {
				member.removeRole(roles[YES])
			}
		}
	}

	else if (command === 'unvote') {
		member.removeRole(roles[NO])
		member.removeRole(roles[YES])
		// channel.send('You have withdrawn your vote')
	}
else if (command === 'vote-info') {
		let yesVotes = 0
		let noVotes = 0

		for (let member of guild.members.array()) {
			if (memberRole(member, YES)) yesVotes += 1
			else if (memberRole(member, NO)) noVotes += 1
		}
		channel.send(`Here:
total members: **${totalMembers(guild)}**
members needed: **${membersNeeded(guild)}**
total for: **${yesVotes}**
total against: **${noVotes}**
		`)
	}

	else if (command === 'help') {
		channel.send(`Here are my commands:
**vote [yes/no]**   - vote for a proposal
**vote-info**   - see the current vote statistics
**unvote**   - cancel your vote

**ping**   - test my speed
		`)
	}

	else if (command === 'turn-info') {
		channel.send(`Here:
**Cycle: ${data.cycleCount}**

${proposal_queue
	.map(id => {
			let name = guild.members.find('id', id).displayName
			if (id === currentTurnMember(guild).id) {
				name = `**${name} <- current turn**`
			}
			return name
		})
	.join('\n')
}
		`)
	}

	else {
		channel.send('I did not understand that')
	}
})


client.on('guildMemberAdd', async member => {
	sendChannel(member.guild, INTRODUCTION_CHANNEL, `
Welcome ${member.displayName}! Please introduce yourself in this channel. You have been placed in the proposal queue: your turn is ${'some number of'} proposals away.
	`)
	updateProposalQueue()
})

client.on('guildMemberRemove', async () => {
	updateProposalQueue()
})

client.login(CONFIG.token)
