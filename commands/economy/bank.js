/**
 * @param {import('../../structures/client.js')} Client
 * @param {import('discord.js').Message} message
 * @param {String[]} args
 */
module.exports = async (Client, message, args) => {
  if (!Client.checkClientPerms(message.channel, 'EMBED_LINKS')) return Client.functions.get('noClientPerms')(message, ['Embed Links'], message.channel);

  const { rows } = await Client.sql.query('SELECT money FROM economy');

  const embed = new Client.Discord.MessageEmbed()
    .setDescription(`The total balance for the economy system is **${Client.formatNum(rows.map(r => r.money).reduce((a, b) => a + b, 0))}** credits.`)
    .setColor(0x00FFFF)
    .setTimestamp()
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL());

  return message.channel.send(embed);
};

module.exports.help = {
  name: 'bank',
  desc: 'Shows the entire balance throughout the server.',
  category: 'economy',
  usage: '?bank',
  aliases: []
};
