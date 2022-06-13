const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, client_id, testing_guild, testing_mode } = require('./config.json');
const fs = require('node:fs');

const commands = [];
const responses = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

var commandsEmbed = new MessageEmbed()
	.setColor("#FF8758")
	.setTitle("Command List")
	.setDescription("Here's a list of commands for Pronouns Bot:\n(Required arguments look like `<this>` and optional ones look like `[this]`)")
	.setAuthor({ name: "Aurillium", iconURL: "https://avatars.githubusercontent.com/u/57483028", url: "https://github.com/Aurillium" });

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
	responses[command.data.name] = command.response;

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
responses["commands"] = async function(interaction) {
	interaction.reply({embeds: [commandsEmbed]});
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

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity('/help 🏳️‍🌈🏳️‍⚧️', { type: 'LISTENING' });
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	await responses[interaction.commandName](interaction);
});

async function onExit() {
	console.log("\nExitting...");
	if (testing_mode) {
		let guild = await client.guilds.fetch(testing_guild);
		for (let i = 0; i < registered.length; i++) {
			const id = registered[i];
			let command = await guild.commands.fetch(id);
			command.delete();
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
