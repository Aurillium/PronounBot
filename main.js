const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, client_id, testing_guild, testing_mode } = require('./config.json');
const { message_embed, sleep } = require("./shared.js");
const openDB = require('better-sqlite3');
const fs = require('node:fs');

const db = openDB("./pronouns.db");

const commands = [];
const command_responses = {};
const button_responses = {};
const button_files = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of button_files) {
	button_responses[file.slice(0, -3)] = require("./buttons/" + file).response;
}

var commandsEmbed = new MessageEmbed()
	.setColor("#FF8758")
	.setTitle("Command List")
	.setDescription("Here's a list of commands for Pronouns Bot:\n(Required arguments look like `<this>` and optional ones look like `[this]`)")
	.setAuthor({ name: "Aurillium", iconURL: "https://avatars.githubusercontent.com/u/57483028", url: "https://github.com/Aurillium" });

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
	command_responses[command.data.name] = command.response;

	let command_string = "/" + command.data.name;
	command.data.options.forEach(option => {
		let j = option.toJSON();
		if (j.required) {
			command_string += " <" + option.toJSON().name + ">";
		} else {
			command_string += " [" + option.toJSON().name + "]";
		}
	});
	commandsEmbed = commandsEmbed.addField(command.data.name, command.doc + "\n**Usage:** `" + command_string + "`\n** **");
}
commands.push(new SlashCommandBuilder().setName('commands').setDescription('Displays a list of commands!'));
command_responses["commands"] = async function(interaction) {
	await interaction.reply({embeds: [commandsEmbed]});
}

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

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

async function change_status() {
	while (true) {
		client.user.setActivity('/help 🏳️‍🌈🏳️‍⚧️', { type: 'LISTENING' });
		await sleep(1000 * 60 * 2);
		//client.user.setActivity(client.guilds.cache.size.toString() + " servers 🏳️‍🌈🏳️‍⚧️", { type: 'WATCHING' });
		await sleep(1000 * 60 * 2);
	}
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	change_status().catch(e => {
		console.log("Status change failed:");
		console.log(e);
	});
});

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		if (interaction.commandName in command_responses) {
			await command_responses[interaction.commandName](interaction, db);
		} else {
			await interaction.reply({embeds: message_embed("That command isn't loaded in this version!", "#FF0000")})
		}
	} else if (interaction.isButton()) {
		let handler_name, argument = interaction.customId.split(":", 1);
		if (handler_name in button_responses) {
			await button_responses[handler_name](interaction, argument, db);
		} else {
			await interaction.reply({embeds: message_embed(`That button isn't loaded in this version!\nCustom ID: "${interaction.customId}"`, "#FF0000")})
		}
	}
});

async function onExit() {
	console.log("\nExitting...");
	if (testing_mode) {
		let guild = await client.guilds.fetch(testing_guild);
		for (let i = 0; i < registered.length; i++) {
			const id = registered[i];
			let command = await guild.commands.fetch(id);
			await command.delete();
			console.log(`- Unregistered '${command.name}'.`);
		}
		console.log("Unregistered all commands; Exitting now.");
	} else {
		console.log("Production mode does not unregister commands; Exitting now.");
	}
}

process.on("SIGINT", () => {
	onExit().then(result => {
		process.exit();
	}).catch(error => {
		console.log(error);
		process.exit();
	});
});

// https://discord.com/api/oauth2/authorize?client_id=983907393823969312&permissions=2147483648&scope=bot%20applications.commands
client.login(token);
