/**
 * TypeScript imports
 */
import { Guild, Message, MessageReaction, User, VoiceChannel } from 'discord.js';

/**
 * Local imports
 */
import { settings, sendMessage, getMessage } from '../utils/settings';
import { getChannel } from './storage';

// List of arrays with keys and values of guild ids and message ids
const activeGames: [string, string][] = [];

/**
 * Create the starting game message and reactions
 * @param {Message} message Message gotten from event
 * @param {VoiceChannel} channel VoiceChannel used for the name replacement
 */
export async function startGame(message: Message, channel: VoiceChannel) {
  if (isGameActive(message.guild)) await stopGame(message, channel);
  const msg = (await sendMessage(message, settings.messages.started, ['{channel}', channel.name])) as Message;
  const guildId = message.guild.id;
  let set = false;
  for (const active of activeGames) {
    if (active[0] === guildId) {
      active[0] = msg.id;
      set = true;
      break;
    }
  }
  if (!set) activeGames.push([guildId, msg.id]);
  await msg.react(settings.emotes.unmute);
  await msg.react(settings.emotes.mute);
}

/**
 * Check if a game is currently running
 * @param {Guild} guild Guild to check for
 * @return {boolean} true if a game is currently running in that guild
 */
export function isGameActive(guild: Guild): boolean {
  for (const pair of activeGames) if (pair[0] === guild.id) return true;
  return false;
}

/**
 * Stop an active event in the Guild of the Message
 * @param {Message} message Message gotten from event
 * @param {VoiceChannel} channel VoiceChannel used for the name replacement
 */
export async function stopGame(message: Message, channel: VoiceChannel) {
  const guildId = message.guild.id;
  for (const active of activeGames) {
    if (active[0] === guildId) {
      const msg = message.channel.messages.find((msg) => msg.id === active[1]);
      if (msg) await msg.edit(getMessage(settings.messages.ended, [['{channel}', channel.name]]));
      msg.reactions.forEach((react) => react.users.forEach(async (user) => await react.remove(user)));
      active[0] = undefined;
      break;
    }
  }
}

/**
 * Handle reactions from the Discord event to mute and unmute users
 * @param {MessageReaction} reaction MessageReaction gotten from event
 * @param {User} user User gotten from event
 */
export async function handleReactions(reaction: MessageReaction, user: User) {
  if (user.id === settings.discord.ID) return;
  const voiceChannelId = getChannel(reaction.message.guild);
  const voiceChannel = voiceChannelId
    ? (reaction.message.guild.channels.find((channel) => channel.id === voiceChannelId) as VoiceChannel)
    : undefined;
  if (!voiceChannel) return;
  const guildId = reaction.message.guild.id;
  let msgId;
  for (const active of activeGames) {
    if (active[0] === guildId) {
      msgId = active[1];
      break;
    }
  }
  if (!msgId || msgId !== reaction.message.id) return;
  await reaction.remove(user);
  switch (reaction.emoji.name) {
    case settings.emotes.unmute:
      voiceChannel.members.forEach((member) => member.setMute(false).catch(() => {}));
      break;
    case settings.emotes.mute:
      voiceChannel.members.forEach((member) => member.setMute(true).catch(() => {}));
      break;
  }
}
