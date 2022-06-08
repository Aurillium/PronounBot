const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, client_id, testing_guild, testing_mode } = require('./config.json');
const fs = require('node:fs');

const commands = [];
const responses = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
	responses[command.data.name] = command.response;
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

// https://discord.com/api/oauth2/authorize?client_id=983907393823969312&permissions=2147483648&scope=bot
client.login(token);
