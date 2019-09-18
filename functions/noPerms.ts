import { Message, GuildChannel, Util } from "discord.js";

module.exports = (message: Message, perms: string[], channel?: GuildChannel): void => {
  const formatted = perms.map(p => `\`${p}\``).join('\n');
  if (channel) return void message.channel.send(`You do not have the required permissions in ${channel.type === 'text' ? channel : `**${Util.escapeMarkdown(channel.name)}**`}.\nThe permissions are:\n\n${formatted}`);
  message.channel.send(`You do not have the required permissions.\nThe permissions are:\n\n${formatted}`);
};
