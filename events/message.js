module.exports = (Client) => {
  return Client.bot.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return message.channel.send('You cannot use me in a DM, please use a server.');
    if (!message.guild.available) return;

    if (!message.channel.permissionsFor(Client.bot.user).has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) return;

    if (!Client.musicfn.guilds[message.guild.id]) {
      Client.musicfn.guilds[message.guild.id] = {
        queueIDs: [],
        queueNames: [],
        skippers: [],
        skips: 0,
        searching: false,
        loop: false,
        volume: 50,
        voiceChannel: null,
        dispatcher: null,
        isPlaying: false,
        paused: false
      };
    }

    require('../functions/level.js')(Client, message);
    require('../functions/deleteinvite.js')(Client, message);

    const row = (await Client.sql.query('SELECT customprefix FROM prefix WHERE guildId = $1 LIMIT 1', [message.guild.id])).rows[0];

    if (!Client.prefixes[message.guild.id]) {
      Client.prefixes[message.guild.id] = row ? row.customprefix : '?';
    }

    const prefix = Client.prefixes[message.guild.id];
    const regexp = new RegExp(`^<@!?${message.client.user.id}> `);
    if ((!message.content.startsWith(prefix) && !message.content.match(regexp)) || message.content === prefix) return;

    let args;

    if (message.content.match(regexp)) args = message.content.slice(message.content.match(regexp)[0].length).split(/ +/g);
    else args = message.content.slice(prefix.length).split(/ +/g);

    const command = args[0].toLowerCase();
    if (!(command in Client.commands) && !Client.allAlias[command]) {
      const unknownCmd = (await Client.sql.query('SELECT * FROM cmdnotfound WHERE guildid = $1 AND bool = $2', [message.guild.id, 1])).rows[0];
      if (unknownCmd) {
        const cmds = Client.getFuzz(command);

        message.reply(`I did not find that command. Did you mean \`${cmds[0][0]}, ${cmds[1][0]}, or ${cmds[2][0]}\`?`);
      }
      return;
    }

    if (await require('../functions/blacklist.js')(Client, message.member)) {
      const obj = await require('../functions/blacklist.js')(Client, message.member);
      if (obj === 'disabled') return;
      return message.reply(`You are blacklisted by ${obj.by} for the reason of \`${Client.escMD(obj.reason)}\`.`);
    }

    if (await require('../functions/gblacklist.js')(Client, message.member)) {
      const reason = await require('../functions/blacklist.js')(Client, message.member);
      return message.reply(`You are globally blacklisted from me for the reason of \`${Client.escMD(reason)}\`. You may appeal in my support server.`);
    }

    if (command in Client.commands) return Client.commands[command](Client, message, args);
    else {
      for (const val in Client.allAlias) {
        const prop = Client.allAlias[val];
        if (val === command) {
          Client.commands[prop](Client, message, args);
          break;
        }
      }
    }
  });
};
