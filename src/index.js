require("dotenv").config();

const prefix = process.env.PREFIX || "!mw";

const fetch = require("node-fetch");

const fetchPlayerStats = async (name) => {
  const url = `https://my.callofduty.com/api/papi-client/stats/cod/v1/title/mw/platform/battle/gamer/${encodeURIComponent(
    name
  )}/profile/type/mp`;

  const res = await fetch(url);
  if (res.ok) {
    const json = await res.json();
    if (json.status === "success") {
      return json;
    } else {
      return undefined;
    }
  }
};

const Player = require("../models").Player;

const findPlayer = async (discordId) => {
  const player = await Player.findOne({
    where: { discordId },
  });

  return player;
};

const Discord = require("discord.js");
const client = new Discord.Client();

const linkPlayer = async (params, msg) => {
  if (params.length != 1) {
    msg.reply(
      `You need to specify your BattleNet name\nExample: \`${prefix} link Poke1650#1284\``
    );
  } else {
    const playerName = params[0];
    const stats = await fetchPlayerStats(playerName);
    if (stats) {
      await Player.create({
        discordId: msg.author.id,
        battlenetName: playerName,
      });
      msg.reply(`Linked your Discord account to user \`${playerName}\``);
    } else {
      msg.reply(`No user found for \`${playerName}\``);
    }
  }
};

const displayStats = async (params, msg) => {
  let playerName = params[0];
  if (!playerName) {
    const player = await findPlayer(msg.author.id);
    if (player) {
      playerName = player.battlenetName;
    }
  }

  if (!playerName) {
    msg.reply(
      `No player name linked to your account\nUse \`${prefix} link YourName#Numbers\``
    );
    return;
  }

  const stats = await fetchPlayerStats(playerName);

  if (!stats) {
    msg.reply(`Failed to fetch stats for ${playerName}`);
    return;
  }

  const { data } = stats;
  const lifetime = data.lifetime.all.properties;

  const embed = new Discord.MessageEmbed()
    .setColor("#959595")
    .setTitle(playerName)
    .addFields(
      { name: "Level", value: data.level, inline: true },
      {
        name: "Time played",
        value: `${(lifetime.timePlayedTotal / 3600).toFixed(2)}h`,
        inline: true,
      },
      {
        name: "Best KD",
        value: lifetime.bestKD,
        inline: true,
      },
      { name: "K/D", value: lifetime.kdRatio.toFixed(2), inline: true },
      { name: "W/L", value: lifetime.wlRatio.toFixed(2), inline: true },
      {
        name: "Acc",
        value: `${lifetime.accuracy.toFixed(2)}%`,
        inline: true,
      },
      { name: "Kills", value: lifetime.kills, inline: true },
      {
        name: "Headshots",
        value: `${lifetime.headshots} (${(
          (lifetime.headshots / lifetime.kills) *
          100
        ).toFixed(2)}%)`,
        inline: true,
      },
      { name: "Best killstreak", value: lifetime.bestKillStreak, inline: true },
      {
        name: "Most kills in a game",
        value: lifetime.bestKills,
        inline: true,
      },
      { name: "Most deaths in a game", value: lifetime.recordDeathsInAMatch }
    );

  if (playerName.startsWith("Poke1650")) {
    embed.addField("Suicides", lifetime.suicides);
  }
  msg.channel.send(embed);
};

const commands = {
  link: linkPlayer,
  stats: displayStats,
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  if (msg.content.startsWith(prefix) && !msg.author.bot) {
    const params = msg.content.split(" ");
    params.shift(); // Remove prefix

    const key = params[0];
    const command = commands[key];
    params.shift(); // Remove command

    if (command) {
      command(params, msg);
    } else {
      msg.reply(
        `No such command.\nCommands: ${Object.keys(commands).join(", ")}`
      );
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
