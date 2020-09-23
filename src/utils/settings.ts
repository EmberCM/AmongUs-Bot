/**
 * TypeScript imports
 */
import { Message } from 'discord.js';

/**
 * Module imports
 */
import { promises as fs } from 'fs';

/**
 * Local imports
 */
import { log, error } from './utils';

const settingsFile = 'settings.json';
let json: {
  discord: {
    ID: string;
    TOKEN: string;
  };
  commandPrefix: string;
  emotes: {
    unmute: string;
    mute: string;
  };
  messages: {
    usage: any;
    setChannelUsage: any;
    invalidChannel: any;
    noVoiceChannel: any;
    setVoiceChannel: any;
    noGameActive: any;
    started: any;
    ended: any;
  };
};

/**
 * Load settings from the settings.json file
 */
export async function loadSettings() {
  log(`Reading ${settingsFile} file...`);
  const file = await fs.readFile(`./resources/${settingsFile}`).catch(() => undefined);

  if (file === undefined) return error('Could not load settings file');

  json = JSON.parse(file.toString());
  log('Successfully loaded settings file');
}

/**
 * Add replacements to a message
 * @param {any} message message to replace
 * @param {Array} replace list of arrays with keys and values as replacements
 * @return {any} message after replacements
 */
export function getMessage(message: any, replace: [string, string][]): any {
  if (typeof message === 'string') {
    for (const replacement of replace) message = message.replace(new RegExp(replacement[0], 'g'), replacement[1]);
    return message.replace(/{prefix}/g, json.commandPrefix);
  }
  let msg = JSON.parse(JSON.stringify(message));
  if (msg.embed.title) {
    for (const replacement of replace) msg.embed.title = msg.embed.title.replace(new RegExp(replacement[0], 'g'), replacement[1]);
    msg.embed.title = msg.embed.title.replace(/{prefix}/g, json.commandPrefix);
  }
  if (msg.embed.description) {
    for (const replacement of replace)
      msg.embed.description = msg.embed.description.replace(new RegExp(replacement[0], 'g'), replacement[1]);
    msg.embed.description = msg.embed.description.replace(/{prefix}/g, json.commandPrefix);
  }
  if (msg.embed.timestamp) msg.embed.timestamp = msg.embed.timestamp.replace('{time}', new Date().toISOString());
  if (msg.embed.fields)
    for (let i = 0; i < msg.embed.fields.length; i++) {
      for (const replacement of replace)
        msg.embed.fields[i].name = msg.embed.fields[i].name.replace(new RegExp(replacement[0], 'g'), replacement[1]);
      msg.embed.fields[i].name = msg.embed.fields[i].name.replace(/{prefix}/g, json.commandPrefix);
      for (const replacement of replace)
        msg.embed.fields[i].value = msg.embed.fields[i].value.replace(new RegExp(replacement[0], 'g'), replacement[1]);
      msg.embed.fields[i].value = msg.embed.fields[i].value.replace(/{prefix}/g, json.commandPrefix);
    }
  return msg;
}

/**
 * Send the message as a reply, or natural if it's json format
 * @param {Message} initial Message to reply to
 * @param {any} send message to send in chat
 * @param {Array} args list of array with keys and values as replacements
 * @return {Message} Message sent in chat
 */
export async function sendMessage(initial: Message, send: any, ...args: [string, string][]): Promise<Message | Message[]> {
  if (typeof send === 'string') {
    return await initial.reply(getMessage(send, args));
  }
  return await initial.channel.send(getMessage(send, args));
}

export { json as settings };
