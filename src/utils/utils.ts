/**
 * TypeScript imports
 */
import { GuildMember, Guild, User, Message, TextChannel } from 'discord.js';

/**
 * Log messages to console with the date and time
 * @param {string} message message to log
 */
export function log(message: string) {
  console.log(`[${getFormattedDate()}] ${message}`);
}

/**
 * Log error messages to console with the date and time
 * @param {string} message message to log
 */
export function error(message: string) {
  console.log(`[${getFormattedDate()}] ERROR: ${message}`);
}

/**
 * Get the right pluralization if a word is singular or plural
 * @param {string} one word to return if it's singular
 * @param {string} multiple word to return if it's plural
 * @param {number} amount how many of the word there are
 * @return {string}
 */
export function pluralize(one: string, multiple: string, amount: number): string {
  return amount === 1 ? one : multiple;
}

/**
 * Get formatted date as MM/dd/yyyy HH:mm:ss
 * @return {string} the date and time as a string
 */
function getFormattedDate(): string {
  const date = new Date();
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${getFormattedTime()}`;
}

/**
 * Get formatted time as HH:mm:ss
 * @return {string} the time as a string
 */
function getFormattedTime(): string {
  const date = new Date();
  const hours = `${date.getHours() > 9 ? '' : '0'}${date.getHours()}`;
  const minutes = `${date.getMinutes() > 9 ? '' : '0'}${date.getMinutes()}`;
  const seconds = `${date.getSeconds() > 9 ? '' : '0'}${date.getSeconds()}`;
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Check if an array contains any of the elements
 * @param {Array} array list of strings as a container
 * @param {Array} elements list of strings to check inside container
 * @param {boolean} ignoreCase compare casing of strings
 * @return {boolean} whether the array contains any of the elements
 */
export function arrayContainsAny(array: string[], elements: string[], ignoreCase: boolean = true): boolean {
  for (const element of elements) {
    if (arrayContains(array, element, ignoreCase)) return true;
  }
  return false;
}

/**
 * Check if an array contains the element
 * @param {Array} array list of strings to check
 * @param {string} element string to check inside the array
 * @param {boolean} ignoreCase compare casing of strings
 * @return {boolean} whether the array contains the element
 */
function arrayContains(array: string[], element: string, ignoreCase: boolean = true): boolean {
  for (const checking of array) {
    if ((ignoreCase && checking.toLowerCase() === element.toLowerCase()) || checking === element) return true;
  }
  return false;
}

/**
 * Check if the member has any of the roles
 * @param {GuildMember} member GuildMember to check
 * @param {Array} roles list of role names
 * @return {boolean} true if the GuildMember has any of the roles
 */
export function hasRole(member: GuildMember, roles: string[]): boolean {
  return arrayContainsAny(
    member.roles.map((role) => role.name),
    roles
  );
}

/**
 * Get a user from a tag, id, or username
 * @param {Guild} guild Guild to search inside
 * @param {string} argument unique data of user
 * @return {Promise<User>} user found from argument
 */
export async function getUser(guild: Guild, argument: string): Promise<User> {
  const escaped = argument.indexOf('<') !== -1 ? argument.replace(/[<@!>]/g, '') : argument.split('#')[0];
  return await guild.fetchMembers().then((guild) => {
    const member = guild.members.find((member) => member.id === escaped || member.user.username.toLowerCase() === escaped.toLowerCase());
    return member ? member.user : undefined;
  });
}

/**
 * Get a message from an id
 * @param {Guild} guild Guild to search inside
 * @param {string} id unique id of message
 * @return {Promise<Message>} Message found from id
 */
export async function getMessage(guild: Guild, id: string): Promise<Message> {
  const channels = guild.channels.array();
  for (const channel of channels) {
    if (channel.type !== 'text') continue;
    const msg: Message = await (channel as TextChannel)
      .fetchMessage(id)
      .then((fmsg) => fmsg)
      .catch(() => undefined);
    if (msg) return msg;
  }
  return undefined;
}
