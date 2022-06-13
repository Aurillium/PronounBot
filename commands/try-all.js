const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_all_pronouns } = require("../sentence_generator.js");

exports.data = new SlashCommandBuilder()
	.setName("try-all")
	.setDescription("Try all pronouns!")
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try.")
			.setRequired(false)
	).addBooleanOption(option =>
		option.setName("hidden")
			.setDescription("Make the message only visible to you.")
			.setRequired(false)
	);

exports.response = async function(interaction) {
	interaction.reply({content: make_all_pronouns(interaction.options.getString("name"), false), ephemeral: interaction.options.getBoolean("hidden") ?? false});
}

exports.doc = `Try out using all pronouns. Just optionally enter a name and the bot will give you some example sentences.`;