/**
 * Module imports
 */
import { Guild, VoiceChannel } from 'discord.js';
import { promises as fs } from 'fs';

/**
 * Local imports
 */
import { log, error, pluralize } from '../utils/utils';

const storageFile = 'storage.json';

// List of arrays with keys and values of guild ids and channel ids
const channels: [string, string][] = [];

/**
 * Save storage file on an interval incase of crash
 */
export async function initializeStorageSaving() {
  setInterval(saveStorage, 1000 * 60 * 60); // 60 minutes
}

/**
 * Load storage from the storage.json file
 */
export async function loadStorage() {
  log(`Reading ${storageFile} file...`);
  const file = await fs.readFile(`./resources/${storageFile}`).catch(() => undefined);

  if (file === undefined) return error('Could not load storage file');

  const json = JSON.parse(file.toString());
  Object.keys(json).forEach((id) => channels.push([id, json[id]]));
  log(`Successfully loaded storage file with ${channels.length} guilds`);
}

/**
 * Save voice channels to the storage.json file
 */
export async function saveStorage() {
  log(`Saving ${storageFile} file...`);
  const json: any = {};
  channels.forEach((id) => (json[id[0]] = id[1]));
  await fs
    .writeFile(`./resources/${storageFile}`, JSON.stringify(json))
    .then(() => log(`Successfully saved storage file with ${channels.length} ${pluralize('guild', 'guilds', channels.length)}`))
    .catch(() => error('Could not load storage file'));
}

/**
 * Set the voice channel of the guild
 * @param {Guild} guild Guild to handle commands in
 * @param {VoiceChannel} channel VoiceChannel to handle muting and unmuting in
 */
export function setChannel(guild: Guild, channel: VoiceChannel) {
  for (const pair of channels) {
    if (pair[0] === guild.id) {
      pair[0] = channel.id;
      return;
    }
  }
  channels.push([guild.id, channel.id]);
}

/**
 * Get the stored VoiceChannel from the specified Guild
 * @param {Guild} guild Guild of the stored channel
 * @return {string} id of the VoiceChannel stored
 */
export function getChannel(guild: Guild): string {
  for (const pair of channels) if (pair[0] === guild.id) return pair[1];
  return undefined;
}
