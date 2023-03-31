"use_strict";

import config from "./config.json" assert { type: "json" };

import { SlashCommandBuilder } from '@discordjs/builders';
import { ShardingManager } from 'discord.js';
import { stamp_console, client_id, sleep } from './shared.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { request } from 'https';
import { readdirSync } from 'node:fs';

stamp_console('MAIN');

const commands = [];
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

const rest = new REST({ version: '9' }).setToken(config.token);
const registered = [];

(async () => {

	for (const file of commandFiles) {
		const command = await import("./commands/" + file);
		commands.push(command.data.toJSON());
	}
	
	commands.push(new SlashCommandBuilder().setName('commands').setDescription('Displays a list of commands!'));

	try {
		console.log('Started refreshing slash commands.');

		if (config.testing_mode) {
			let registered_commands = await rest.put(	
				Routes.applicationGuildCommands(client_id, config.testing_guild),
				{ body: commands },
			);
			registered_commands.forEach(command => {
				registered.push(command.id);
			});
		} else {
			await rest.put(
				Routes.applicationCommands(client_id),
				{ body: commands },
			);
		}

		console.log('Successfully reloaded slash commands.');
	} catch (error) {
		console.error(error);
	}
})();

async function update_topgg() {
	let options = {
		hostname: "top.gg",
		port: 443,
		path: "/api/bots/" + client_id + "/stats",
		method: "POST",
		headers: {
			 'Authorization': config.topgg_token,
			 'Content-Type': 'application/json'
		   }
	};
	while (true) {
		let servers = (await manager.fetchClientValues("guilds.cache.size")).reduce((acc, guildCount) => acc + guildCount, 0);
		let content = '{"server_count":' + servers.toString() + '}';
		options.headers['Content-Length'] = content.length;

		let req = request(options, (res) => {
			console.log('Status:', res.statusCode);
			if (res.statusCode !== 200) {
				console.log('Headers:', res.headers);
				console.log('Data:');
				res.on('data', process.stdout.write);
			}
		});
		
		req.on('error', console.log);
		
		req.write(content);
		req.end();
		console.log("TOP.GG STATS UPLOADED.");

		await sleep(1000 * 3600);
	}
}

const manager = new ShardingManager('./bot.js', {
	token: config.token
});

manager.on("shardCreate", shard => {
	console.log(`Launched shard ${shard.id}`);

	// Give the client their shard
	shard.on("ready", () => {
		shard.send({type: "shard_id", data: shard.id});
	});
});

// Make sure we have some shards to test
if (config.testing_mode) {
	manager.totalShards = 2;
}

// When all shards are up
manager.spawn().then(shards => {
	if (!config.testing_mode) {
		update_topgg().catch(e => {
			console.log("Top.gg update failed:");
			console.log(e);
		});
	}
	for (const [i, shard] of shards) {
		shard.send({type: "loaded"});
	}
});

async function onExit() {
	for (const [i, shard] of manager.shards) {
		shard.send({type: "exit"});
	}
	if (config.testing_mode) {
		let registered = await rest.get(Routes.applicationGuildCommands(client_id, config.testing_guild));
		for (let i = 0; i < registered.length; i++) {
			const command = registered[i];
			await rest.delete(Routes.applicationGuildCommand(client_id, config.testing_guild, command.id));
			console.log(`- Unregistered '${command.name}'.`);
		}
		console.log("Unregistered all commands; Exitting now.");
	} else {
		console.log("Production mode does not unregister commands; Exitting now.");
	}
}

process.on("SIGINT", () => {
	onExit().then(() => {
		console.log("Bot exited.");
		process.exit();
	}).catch(error => {
		console.log(error);
		console.log("Bot exited with errors.");
		process.exit();
	});
});