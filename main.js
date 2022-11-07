"use_strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { ShardingManager } = require('discord.js');
const { token, testing_mode, client_id, testing_guild } = require("./config.json");
const { stamp_console } = require('./shared');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');

stamp_console('MAIN');
let exitting = false;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
commands.push(new SlashCommandBuilder().setName('commands').setDescription('Displays a list of commands!'));

const rest = new REST({ version: '9' }).setToken(token);
const registered = [];

(async () => {
	try {
		console.log('Started refreshing slash commands.');

		if (testing_mode) {
			let registered_commands = await rest.put(	
				Routes.applicationGuildCommands(client_id, testing_guild),
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

const manager = new ShardingManager('./bot.js', {
	token: token
});

manager.on("shardCreate", shard => {
	console.log(`Launched shard ${shard.id}`);

	// Give the client their shard
	shard.on("ready", () => {
		shard.send({type: "shard_id", data: shard.id});
	});
});

manager.spawn();

async function onExit() {
	for (const [i, shard] of manager.shards) {
		shard.send({type: "exit"});
	}
	if (testing_mode) {
		let registered = await rest.get(Routes.applicationGuildCommands(client_id, testing_guild));
		for (let i = 0; i < registered.length; i++) {
			const command = registered[i];
			await rest.delete(Routes.applicationGuildCommand(client_id, testing_guild, command.id));
			console.log(`- Unregistered '${command.name}'.`);
		}
		console.log("Unregistered all commands; Exitting now.");
	} else {
		console.log("Production mode does not unregister commands; Exitting now.");
	}
}

process.on("SIGINT", () => {
	onExit().then(() => {
		process.exit();
	}).catch(error => {
		console.log(error);
		process.exit();
	});
});