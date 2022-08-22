const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, client_id, testing_guild, testing_mode, topgg_token } = require('./config.json');
const { message_embed, sleep, expand_set } = require("./shared.js");
const openDB = require('better-sqlite3');
const fs = require('node:fs');
const { make_sentences, make_one_command_sentences } = require('./sentence_generator');

const db = openDB("./pronouns.db");

const commands = [];
const command_responses = {};
const button_responses = {};
const button_files = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const author = { name: "Aurillium", iconURL: "https://avatars.githubusercontent.com/u/57483028", url: "https://github.com/Aurillium" };

for (const file of button_files) {
	button_responses[file.slice(0, -3)] = require("./buttons/" + file).response;
}

var commandsEmbed = new MessageEmbed()
	.setColor("#FF8758")
	.setTitle("Command List")
	.setDescription("Here's a list of commands for Pronouns Bot:\n(Required arguments look like `<this>` and optional ones look like `[this]`)")
	.setAuthor(author);

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

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials: ["CHANNEL"] });

async function change_status() {
	let delay = 1000 * 60 * 2;
	if (testing_mode) {
		delay = 1000 * 5;
	}
	while (true) {
		client.user.setActivity('/help 🏳️‍🌈🏳️‍⚧️', { type: 'LISTENING' });
		await sleep(delay);
		client.user.setActivity(client.guilds.cache.size.toString() + " servers 🏳️‍🌈🏳️‍⚧️", { type: 'WATCHING' });
		await sleep(delay);
	}
}

async function update_topgg() {
	let options = {
		hostname: "top.gg",
		port: 443,
		path: "/api/bots/" + client.user.id + "/stats",
		method: "POST",
		headers: {
			 'Authorization': topgg_token,
			 'Content-Type': 'application/json'
		   }
	};
	while (true) {
		if (!testing_mode) {
			console.log("UPLOADING STATS TO TOP.GG...");

			let content = '{"server_count":' + client.guilds.cache.size.toString() + '}';
			options.headers['Content-Length'] = content.length;

			var req = https.request(options, (res) => {

				console.log('Status:', res.statusCode);
				console.log('Headers:', res.headers);
			
				console.log('Data:');
				res.on('data', (d) => {
					process.stdout.write(d);
				});
			});
			
			req.on('error', (e) => {
				console.error(e);
			});
			
			req.write(content);
			req.end();
			console.log("TOP.GG STATS UPLOADED.");
		}
		await sleep(1000 * 3600);
	}
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	change_status().catch(e => {
		console.log("Status change failed:");
		console.log(e);
	});
	update_topgg().catch(e => {
		console.log("Top.gg update failed:");
		console.log(e);
	});
});

client.on('interactionCreate', async interaction => {
	try {
		if (interaction.isCommand()) {
			if (interaction.commandName in command_responses) {
				await command_responses[interaction.commandName](interaction, db);
			} else {
				await interaction.reply({embeds: [message_embed("That command isn't loaded in this version!", "#FF0000")]})
			}
		} else if (interaction.isButton()) {
			const [handler_name, ...rest] = interaction.customId.split(":");
			if (handler_name in button_responses) {
				await button_responses[handler_name](interaction, rest.join(":"), db);
			} else {
				await interaction.reply({embeds: [message_embed(`That button isn't loaded in this version!\nCustom ID: "${interaction.customId}"`, "#FF0000")]})
			}
		}
	} catch (error) {
		console.warn("=== ERROR ===");
		console.warn("Error: " + error.message);
		console.warn("Trace: " + error.stack);
		var error_embed = new MessageEmbed()
			.setColor("#FF0000")
			.setTitle("Oops!")
			.setAuthor(author)
			.setDescription("**An error has occcurred.**\nPlease share the following information (along with what you were doing at the time) in a new issue on [GitHub](https://github.com/Aurillium/PronounBot/issues/new), or on our [support server](https://discord.gg/ZnRzV469rJ), and we will look into it and resolve it.\n\n**Stack Trace:**\n" + error.stack)
		try {
			await interaction.reply({embeds: [error_embed]});
		} catch (error) {
			await interaction.channel.send({embeds: [error_embed]});
		}
	}
});

client.on('messageCreate', async message => {
	try {

		if (message.mentions.members === null) {
			if (message.content == null) return;
		} else {
			if (!message.mentions.members.map(user => user.id).includes(client.user.id)) return;
		}
		if (message.author.bot) return;

		const deleter = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId("delete_try:" + message.author.id)
					.setLabel("Delete")
					.setEmoji("🗑️")
					.setStyle("DANGER"),
			);

		let raw_names = [];
		let raw_terms = [];
		let raw_sets = [];
		let args = {names: [], sets: [], terms: [], plural: null, hidden: null, all_pronouns: false, no_pronouns: false, random_pronouns: false};
		let plural_warned = false;
		let hidden_warned = false;
		for (const line of message.content.replaceAll(client.user.toString(), "").split("\n")) {
			if (!line.includes(":")) continue;
			[key, value] = line.split(":", 2);
			key = key.trim().toLowerCase();
			value = value.trim().toLowerCase();
			if (key === "name" || key === "names" || key === "n") {
				for (const name of value.split(new RegExp("[/,]"))) {
					raw_names.push(name.trim());
				}
			} else if (key === "term" || key === "terms" || key === "t") {
				for (const term of value.split(new RegExp("[/, ]"))) {
					raw_terms.push(term.trim());
				}
			} else if (key === "pronouns" || key === "sets" || key === "set" || key === "p") {
				if (value === "all" || value === "a") {
					if (args.no_pronouns || args.random_pronouns) {
						await message.reply({embeds: [message_embed("You can only specify all, no *or* random pronouns, not multiple.")], components: [deleter]});
						return;
					}
					args.all_pronouns = true;
				} else if (value === "none" || value === "no" || value === "n") {
					if (args.all_pronouns || args.random_pronouns) {
						await message.reply({embeds: [message_embed("You can only specify all, no *or* random pronouns, not multiple.")], components: [deleter]});
						return;
					}
					args.no_pronouns = true;
				} else if (value === "random" || value === "rand" || value === "r") {
					if (args.all_pronouns || args.no_pronouns) {
						await message.reply({embeds: [message_embed("You can only specify all, no *or* random pronouns, not multiple.")], components: [deleter]});
						return;
					}
					args.random_pronouns = true;
				} else {
					for (const term of value.split(new RegExp("[, ]"))) {
						raw_sets.push(term.trim());
					}
				}
			} else if (key === "plural" || key === "pl") {
				if (args.plural !== null && !plural_warned) {
					await message.reply({embeds: [message_embed("Muliple 'plural' values detected. Please only use one.")], components: [deleter]});
					return;
				}
				if (value === "y" || value === "yes" || value === "t" || value === "true") {
					args.plural = true;
				} else if (value === "n" || value === "no" || value === "f" || value === "false") {
					args.plural = false;
				} else {
					await message.reply({embeds: [message_embed("Invalid 'plural' option detected. Only 'yes', 'no' , 'true', 'false', or their abbreviations are valid values.")], components: [deleter]});
					return;
				}
			
			// Not relevant as the command message is visible anyway and the command works in DMs

			/*} else if (key === "hidden" || key === "h") {
				if (args.hidden !== null && !hidden_warned) {
					await message.reply({embeds: [message_embed("Muliple 'hidden' values detected. Please only use one.")], components: [deleter]});
					return;
				}
				if (value === "y" || value === "yes" || value === "t" || value === "true") {
					args.hidden = true;
				} else if (value === "n" || value === "no" || value === "f" || value === "false") {
					args.hidden = false;
				} else {
					await message.reply({embeds: [message_embed("Invalid 'hidden' option detected. Only 'yes', 'no' , 'true', 'false', or their abbreviations are valid values.")], components: [deleter]});
					return;
				}*/
			} else {
				await message.reply({embeds: [message_embed("Invalid key: '" + key + "'. It will be ignored.")], components: [deleter]});
			}
		}

		for (const name of raw_names) {
			if (name !== "" && !args.names.includes(name)) args.names.push(name);
		}
		for (const term of raw_terms) {
			if (term !== "" && !args.terms.includes(term)) args.terms.push(term);
		}

		if (!args.no_pronouns && !args.all_pronouns && !args.random_pronouns) {
			for (const raw_set of raw_sets) {
				if (raw_set !== "") {
					let set = expand_set(raw_set.split("/"));
					if (set === null) {
						await message.reply({embeds: [message_embed("Pronoun sets must have either four or five pronouns (check /help for more information): '" + raw_set + "'.")], components: [deleter]});
						return;
					}
					if (!args.sets.map(element => element.join("/")).includes(set.join("/"))) {
						args.sets.push(set);
					}
				}
			}
		}

		if (args.no_pronouns && args.sets.length !== 0) {
			await message.reply({embeds: [message_embed("Cannot use no pronouns and specific sets at the same time.")], components: [deleter]});
			return;
		} else if (args.random_pronouns && args.sets.length !== 0) {
			await message.reply({embeds: [message_embed("Cannot use a random pronoun set and specific sets at the same time.")], components: [deleter]});
			return;
		}

		// ALL ERRORS SHOULD BE DEALT WITH BY HERE

		const response_text = args.names.length === 0 ? "How do these look?" : "How do these look " + args.names[Math.floor(Math.random() * args.names.length)] + "?";

		let statement;
		if (args.all_pronouns || args.random_pronouns) {
			if (args.plural) {
				statement = db.prepare("SELECT Subjective, Objective, Possessive, Possessive2, Reflexive FROM Sets");
			} else {
				statement = db.prepare("SELECT Subjective, Objective, Possessive, Possessive2, Reflexive FROM Sets WHERE Plural=0");
			}
		}

		let sentences = "";
		if (args.no_pronouns) {
			sentences = make_one_command_sentences([], args.names, args.plural, db, response_text);
		} else if (args.all_pronouns) {
			let sets = [];
			for (const row of statement.all()) {
				sets.push([row.Subjective, row.Objective, row.Possessive, row.Possessive2, row.Reflexive]);
			}
			sentences = make_one_command_sentences(sets.concat(args.sets), args.names, args.plural, db, response_text);
		} else if (args.random_pronouns) {
			let sets = [];
			for (const row of statement.all()) {
				sets.push([row.Subjective, row.Objective, row.Possessive, row.Possessive2, row.Reflexive]);
			}
			sentences = make_one_command_sentences([sets[Math.floor(Math.random() * sets.length)]], args.names, args.plural, db, response_text);
		} else {
			sentences = make_one_command_sentences(args.sets, args.names, args.plural, db, response_text);
		}

		// NOT HIDDEN FOR NOW
		if (args.hidden && 0) {
			const dm = await message.author.createDM();
			await dm.send({content: "`" + JSON.stringify(args) + "`", components: [deleter]})
		} else {
			await message.reply({content: sentences, components: [deleter]});
		}

	} catch (error) {
		if (error.message !== "Missing Permissions") {
			console.warn("=== ERROR ===");
			console.warn("Error: " + error.message);
			console.warn("Trace: " + error.stack);
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
