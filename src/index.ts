/**
 * TypeScript imports
 */
import { Message, MessageReaction, User } from 'discord.js';

/**
 * Module imports
 */
import { Client } from 'discord.js';

/**
 * Local imports
 */
import { amongUsCommand } from './modules/commands/amongus';
import { handleReactions } from './modules/game';
import { initializeStorageSaving, loadStorage } from './modules/storage';
import { loadSettings, settings } from './utils/settings';
import { log } from './utils/utils';

// Client object for connecting to Discord API
const client = new Client();

/**
 * Initialize settings and storage before connecting to Discord
 */
async function initialize() {
  await loadSettings();
  await loadStorage();

  await initializeStorageSaving();

  await client.login(settings.discord.TOKEN);
}

/**
 * Confirmation on successfully connecting to Discord
 */
client.once('ready', () => {
  log('Connected to Discord servers. Ready to use');
});

/**
 * Discord Event: Message
 * Handle commands
 */
client.on('message', async (message: Message) => {
  const msg = message.content;
  if (!msg || msg.length === 1 || msg[0] !== settings.commandPrefix) return;
  const allArgs = msg.split(' ');
  const args = allArgs.length === 1 ? [] : allArgs.splice(1);
  switch (allArgs[0].substr(1).toLowerCase()) {
    case 'amongus':
    case 'au':
      await amongUsCommand(message, args);
      break;
  }
});

/**
 * Discord Event: MessageReactionAdd
 * Handle muting and unmuting users
 */
client.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
  await handleReactions(reaction, user);
});

initialize();
