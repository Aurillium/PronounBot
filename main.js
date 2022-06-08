const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config.json');
const fs = require('node:fs');

const commands = [];
const responses = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const clientId = '983907393823969312';
const guildId = '536455056443310080';
const testing = true;

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
	responses[command.data.name] = command.response;
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing slash commands.');

		if (testing) {
			await rest.put(	
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);
		} else {
			await rest.put(
				Routes.applicationCommands(clientId),
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

// https://discord.com/api/oauth2/authorize?client_id=983907393823969312&permissions=277025392640&scope=bot%20applications.commands
client.login(token);
