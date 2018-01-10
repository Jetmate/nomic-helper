'use strict';

require('babel-polyfill');

var _discord = require('discord.js');

var _discord2 = _interopRequireDefault(_discord);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function loadJson(filePath) {
	return JSON.parse(_fs2.default.readFileSync(_path2.default.resolve(__dirname, filePath), 'utf8'));
}

function writeJson(filePath, data) {
	_fs2.default.writeFile(_path2.default.resolve(__dirname, filePath), JSON.stringify(data), 'utf8', function (err) {
		console.log(err);
	});
}

var CONFIG_PATH = void 0,
    DATA_PATH = void 0;
if (process.env.NODE_ENV === 'production') {
	CONFIG_PATH = './config.json';
	DATA_PATH = './data.json';
} else {
	CONFIG_PATH = '../config.json';
	DATA_PATH = '../data.json';
}
var CONFIG = loadJson(CONFIG_PATH);

var BOT_NUMBER = 2;
var PRODUCTION_PREFIX = '$';
var GUILD = 'Northside Nomic';

var VOTING_CHANNEL = 'voting';
var INTRODUCTION_CHANNEL = 'introductions';
var PROPOSAL_CHANNEL = 'current-proposal';
var ANNOUNCEMENT_CHANNEL = 'announcements';
var ARCHIVE_CHANNEL = 'archived-proposals';

var DEVELOPER_ROLE = 'react developer';
var YES = 'yes';
var NO = 'no';
var ADMIN_ROLE = 'gm';
var CURRENT_TURN_ROLE = 'my-turn';

function findRole(guild, name) {
	return guild.roles.find('name', name);
}

function memberRole(member, name) {
	return member.roles.find('name', name);
}

function findChannel(guild, name) {
	return guild.channels.find('name', name);
}

function sendChannel(guild, name, message) {
	return findChannel(guild, name).send(message);
}

function cleanChannel(guild, name) {
	findChannel(guild, name).bulkDelete(100, true);
}

function totalMembers() {
	return proposalQueue.length;
}

function membersNeeded() {
	return Math.round(totalMembers() / 2);
}

function calculateProposalQueue(client) {
	return client.guilds.find('name', GUILD).members.filter(function (member) {
		return !member.user.bot;
	}).sort(function (a, b) {
		return a.joinedTimestamp - b.joinedTimestamp;
	}).map(function (member) {
		return member.id;
	});
}

function currentTurnMember(guild) {
	return guild.members.filterArray(function (member) {
		return memberRole(member, CURRENT_TURN_ROLE);
	})[0];
}

// const data = loadJson(DATA_PATH)

// function setData (name, value) {
// 	data[name] = value
// 	writeJson(DATA_PATH, data)
// }

var client = new _discord2.default.Client();
var proposalQueue = void 0;

function updateProposalQueue() {
	proposalQueue = calculateProposalQueue(client);
}

client.on('ready', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	return regeneratorRuntime.wrap(function _callee$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					updateProposalQueue();

				case 1:
				case 'end':
					return _context.stop();
			}
		}
	}, _callee, undefined);
})));

client.on('message', function () {
	var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(message) {
		var _roles;

		var args, command, member, channel, guild, roles, m, yesVotes, noVotes, memberCountHalf, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, member2, end, difference, previousTurnMember, previousTurnI, nextTurnI, activeTurnMember, messages, _yesVotes, _noVotes, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _member, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _member2;

		return regeneratorRuntime.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						if (!message.author.bot) {
							_context2.next = 2;
							break;
						}

						return _context2.abrupt('return');

					case 2:
						if (!(message.content.indexOf(CONFIG.prefix) !== 0)) {
							_context2.next = 4;
							break;
						}

						return _context2.abrupt('return');

					case 4:
						if (!(process.env.NODE_ENV !== 'production' && !memberRole(message.member, DEVELOPER_ROLE))) {
							_context2.next = 7;
							break;
						}

						message.channel.send('I am a tester bot. Use the ' + PRODUCTION_PREFIX + ' instead.');
						return _context2.abrupt('return');

					case 7:
						if (currentTurnMember(message.guild)) {
							_context2.next = 10;
							break;
						}

						message.channel.send('Warning! No ' + CURRENT_TURN_ROLE + ' role is set. **This must be fixed immediately >:(**.');
						return _context2.abrupt('return');

					case 10:
						args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/g);
						command = args.shift().toLowerCase();
						member = message.member, channel = message.channel, guild = message.guild;
						roles = (_roles = {}, _defineProperty(_roles, YES, findRole(guild, YES)), _defineProperty(_roles, NO, findRole(guild, NO)), _defineProperty(_roles, CURRENT_TURN_ROLE, findRole(guild, CURRENT_TURN_ROLE)), _roles);

						if (!(command === 'ping')) {
							_context2.next = 21;
							break;
						}

						_context2.next = 17;
						return channel.send('Ping?');

					case 17:
						m = _context2.sent;

						m.edit('Pong! Latency is ' + (m.createdTimestamp - message.createdTimestamp) + 'ms. API Latency is ' + Math.round(client.ping) + 'ms');
						_context2.next = 114;
						break;

					case 21:
						if (!(command === 'vote')) {
							_context2.next = 53;
							break;
						}

						if (!(args[0] !== YES && args[0] !== NO)) {
							_context2.next = 25;
							break;
						}

						channel.send('You must vote \'' + YES + '\' or \'' + NO + '\'');
						return _context2.abrupt('return');

					case 25:
						yesVotes = args[0] === YES ? 1 : 0;
						noVotes = args[0] === NO ? 1 : 0;
						memberCountHalf = membersNeeded();
						_iteratorNormalCompletion = true;
						_didIteratorError = false;
						_iteratorError = undefined;
						_context2.prev = 31;


						for (_iterator = guild.members.array()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							member2 = _step.value;

							if (member2.id !== member.id) {
								if (memberRole(member2, YES)) yesVotes += 1;else if (memberRole(member2, NO)) noVotes += 1;
							}
						}

						_context2.next = 39;
						break;

					case 35:
						_context2.prev = 35;
						_context2.t0 = _context2['catch'](31);
						_didIteratorError = true;
						_iteratorError = _context2.t0;

					case 39:
						_context2.prev = 39;
						_context2.prev = 40;

						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}

					case 42:
						_context2.prev = 42;

						if (!_didIteratorError) {
							_context2.next = 45;
							break;
						}

						throw _iteratorError;

					case 45:
						return _context2.finish(42);

					case 46:
						return _context2.finish(39);

					case 47:
						end = void 0, difference = void 0;

						if (yesVotes >= memberCountHalf) {
							sendChannel(guild, VOTING_CHANNEL, 'The proposal has been passed!');
							end = 'passed';
							difference = yesVotes - noVotes;
						} else if (noVotes > memberCountHalf) {
							sendChannel(guild, VOTING_CHANNEL, 'The proposal has been rejected!');
							end = 'rejected';
							difference = noVotes - yesVotes;
						}

						console.log(1);
						if (end) {
							// for (let member2 of guild.members.array()) {
							// 	member2.removeRole(roles[NO])
							// 	member2.removeRole(roles[YES])
							// }


							previousTurnMember = currentTurnMember(guild);


							previousTurnMember.removeRole(roles[CURRENT_TURN_ROLE]);
							previousTurnI = proposalQueue.indexOf(previousTurnMember.id);
							nextTurnI = void 0;

							if (previousTurnI === proposalQueue.length - 1) {
								// TODO: get this to work
								// setData('cycleCount', data.cycleCount + 1)
								// sendChannel(guild, ANNOUNCEMENT_CHANNEL, `Cycle #${data.cycleCount} has begun!`)
								nextTurnI = 0;
							} else {
								nextTurnI = previousTurnI + 1;
							}
							activeTurnMember = guild.members.find('id', proposalQueue[nextTurnI]);

							activeTurnMember.addRole(roles[CURRENT_TURN_ROLE]);

							messages = findChannel(guild, PROPOSAL_CHANNEL).messages.array().slice(1);

							sendChannel(guild, ARCHIVE_CHANNEL, '\n**Action: ' + messages.shift() + '**\nSponsor: ' + previousTurnMember.displayName + '\nStatus: ' + end + ' by ' + difference + ' votes\n__**Proposal Text**__\n' + messages.join('\n') + '\n\t\t\t');
							cleanChannel(guild, PROPOSAL_CHANNEL);
							sendChannel(guild, PROPOSAL_CHANNEL, 'Submit official proposals here. It is currently ' + activeTurnMember.displayName + '\'s turn.');
						} else {
							member.addRole(roles[args[0]]);
							// channel.send(`You have voted ${args[0]}`)

							if (args[0] === YES && memberRole(member, NO)) {
								member.removeRole(roles[NO]);
							} else if (args[0] === NO && memberRole(member, YES)) {
								member.removeRole(roles[YES]);
							}
						}
						_context2.next = 114;
						break;

					case 53:
						if (!(command === 'unvote')) {
							_context2.next = 58;
							break;
						}

						member.removeRole(roles[NO]);
						member.removeRole(roles[YES]);
						// channel.send('You have withdrawn your vote')
						_context2.next = 114;
						break;

					case 58:
						if (!(command === 'vote-info')) {
							_context2.next = 83;
							break;
						}

						_yesVotes = 0;
						_noVotes = 0;
						_iteratorNormalCompletion2 = true;
						_didIteratorError2 = false;
						_iteratorError2 = undefined;
						_context2.prev = 64;


						for (_iterator2 = guild.members.array()[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							_member = _step2.value;

							if (memberRole(_member, YES)) _yesVotes += 1;else if (memberRole(_member, NO)) _noVotes += 1;
						}
						_context2.next = 72;
						break;

					case 68:
						_context2.prev = 68;
						_context2.t1 = _context2['catch'](64);
						_didIteratorError2 = true;
						_iteratorError2 = _context2.t1;

					case 72:
						_context2.prev = 72;
						_context2.prev = 73;

						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}

					case 75:
						_context2.prev = 75;

						if (!_didIteratorError2) {
							_context2.next = 78;
							break;
						}

						throw _iteratorError2;

					case 78:
						return _context2.finish(75);

					case 79:
						return _context2.finish(72);

					case 80:
						channel.send('Here:\ntotal members: **' + totalMembers() + '**\nmembers needed: **' + membersNeeded(guild) + '**\ntotal for: **' + _yesVotes + '**\ntotal against: **' + _noVotes + '**\n\t\t');
						_context2.next = 114;
						break;

					case 83:
						if (!(command === 'help')) {
							_context2.next = 87;
							break;
						}

						channel.send('Here are my commands:\n**vote [yes/no]**   - vote for a proposal\n**vote-info**   - see the current vote statistics\n**unvote**   - cancel your vote\n\n**turn-info**   - see the current turns\n\n**ping**   - test my speed\n\t\t');
						_context2.next = 114;
						break;

					case 87:
						if (!(command === 'turn-info')) {
							_context2.next = 91;
							break;
						}

						// **Cycle: ${data.cycleCount}**
						channel.send('Here:\n' + proposalQueue.map(function (id) {
							var name = guild.members.find('id', id).displayName;
							if (id === currentTurnMember(guild).id) {
								name = '**' + name + ' <- current turn**';
							}
							return name;
						}).join('\n') + '\n\t\t');
						_context2.next = 114;
						break;

					case 91:
						if (!(process.env.NODE_ENV !== 'production' && command === 'green')) {
							_context2.next = 113;
							break;
						}

						_iteratorNormalCompletion3 = true;
						_didIteratorError3 = false;
						_iteratorError3 = undefined;
						_context2.prev = 95;

						for (_iterator3 = guild.members.array()[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							_member2 = _step3.value;

							_member2.addRole(roles[YES]);
						}
						_context2.next = 103;
						break;

					case 99:
						_context2.prev = 99;
						_context2.t2 = _context2['catch'](95);
						_didIteratorError3 = true;
						_iteratorError3 = _context2.t2;

					case 103:
						_context2.prev = 103;
						_context2.prev = 104;

						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}

					case 106:
						_context2.prev = 106;

						if (!_didIteratorError3) {
							_context2.next = 109;
							break;
						}

						throw _iteratorError3;

					case 109:
						return _context2.finish(106);

					case 110:
						return _context2.finish(103);

					case 111:
						_context2.next = 114;
						break;

					case 113:
						if (process.env.NODE_ENV !== 'production' && command === 'clear') {
							channel.bulkDelete(parseInt(args[0]) + 1);
						} else {
							channel.send('I did not understand that');
						}

					case 114:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, undefined, [[31, 35, 39, 47], [40,, 42, 46], [64, 68, 72, 80], [73,, 75, 79], [95, 99, 103, 111], [104,, 106, 110]]);
	}));

	return function (_x) {
		return _ref2.apply(this, arguments);
	};
}());

client.on('guildMemberAdd', function () {
	var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(member) {
		return regeneratorRuntime.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						sendChannel(member.guild, INTRODUCTION_CHANNEL, '\nWelcome ' + member.displayName + '! Please introduce yourself in this channel. You have been placed in the proposal queue: your can view your place with `' + PRODUCTION_PREFIX + 'turn-info`.\n\t');
						updateProposalQueue();

					case 2:
					case 'end':
						return _context3.stop();
				}
			}
		}, _callee3, undefined);
	}));

	return function (_x2) {
		return _ref3.apply(this, arguments);
	};
}());

client.on('guildMemberRemove', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
	return regeneratorRuntime.wrap(function _callee4$(_context4) {
		while (1) {
			switch (_context4.prev = _context4.next) {
				case 0:
					updateProposalQueue();

				case 1:
				case 'end':
					return _context4.stop();
			}
		}
	}, _callee4, undefined);
})));

client.login(CONFIG.token);