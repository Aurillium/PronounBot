const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_sentences } = require("../sentence_generator.js");
const { delete_row } = require("../shared.js");

exports.data = new SlashCommandBuilder()
	.setName("try-none")
	.setDescription("Try no pronouns!")
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try.")
			.setRequired(true)
	).addBooleanOption(option =>
		option.setName("hidden")
			.setDescription("Make the message only visible to you.")
			.setRequired(false)
	);

exports.response = async function(interaction) {
	let hidden = interaction.options.getBoolean("hidden") ?? false;
	interaction.reply({content: make_sentences(null, null, null, null, null, interaction.options.getString("name"), false), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

exports.doc = `Try out using no pronouns. All you need to specify is a name and the bot will give you some example sentences.`;