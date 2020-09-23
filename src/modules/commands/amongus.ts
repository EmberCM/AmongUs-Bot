/**
 * TypeScript imports
 */
import { Guild, Message, VoiceChannel } from 'discord.js';

/**
 * Local imports
 */
import { isGameActive, startGame, stopGame } from '../game';
import { getChannel, setChannel } from '../storage';
import { settings, sendMessage } from '../../utils/settings';

/**
 * Handle the main AmongUs command from the Discord event
 * @param {Message} message Message gotten from event
 * @param {Array} args command arguments gotten from event
 */
export async function amongUsCommand(message: Message, args: string[]) {
  if (message.channel.type !== 'text') return;

  if (args.length > 0) {
    switch (args[0].toLowerCase()) {
      case 'start':
        startSubcmd(message);
        break;
      case 'stop':
        stopSubcmd(message);
        break;
      case 'setchannel':
        if (args.length == 1) {
          sendMessage(message, settings.messages.setChannelUsage);
          break;
        }
        const channel = getVoiceChannel(message.guild, args[1]);
        setChannelSubcmd(message, channel);
        break;
    }
  }

  sendMessage(message, settings.messages.usage);
}

/**
 * Handle the start sub-command
 * @param {Message} message Message gotten from event
 */
function startSubcmd(message: Message) {
  const channelId = getChannel(message.guild);
  const channel = channelId ? message.guild.channels.find((ch) => ch.id === channelId) : undefined;
  if (!channel) {
    sendMessage(message, settings.messages.noVoiceChannel);
    return;
  }
  startGame(message, channel as VoiceChannel);
}

/**
 * Handle the stop sub-command
 * @param {Message} message Message gotten from event
 */
function stopSubcmd(message: Message) {
  if (!isGameActive(message.guild)) {
    sendMessage(message, settings.messages.noGameActive);
    return;
  }
  const channelId = getChannel(message.guild);
  const channel = channelId ? message.guild.channels.find((ch) => ch.id === channelId) : undefined;
  if (!channel) {
    sendMessage(message, settings.messages.noVoiceChannel);
    return;
  }
  stopGame(message, channel as VoiceChannel);
}

/**
 * Handle the setchannel sub-command
 * @param {Message} message Message gotten from event
 * @param {VoiceChannel} channel VoiceChannel to save
 */
function setChannelSubcmd(message: Message, channel: VoiceChannel) {
  if (!channel) {
    sendMessage(message, settings.messages.invalidChannel);
    return;
  }
  setChannel(message.guild, channel);
  sendMessage(message, settings.messages.setVoiceChannel, ['{channel}', `<#${channel.id}>`]);
}

/**
 * Get a VoiceChannel from the Guild specified
 * @param {Guild} guild Guild to search in
 * @param {string} argument name or id of the VoiceChannel to find
 * @return {VoiceChannel} VoiceChannel found from the argument
 */
function getVoiceChannel(guild: Guild, argument: string): VoiceChannel {
  return guild.channels
    .filter((ch) => ch.type === 'voice')
    .find(
      (ch) =>
        ch.name.toLowerCase().includes(argument.toLowerCase()) || ch.name.toLowerCase() === argument.toLowerCase() || ch.id === argument
    ) as VoiceChannel;
}
