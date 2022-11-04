const { ShardingManager } = require('discord.js');

const manager = new ShardingManager('./bot.js', {});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();
