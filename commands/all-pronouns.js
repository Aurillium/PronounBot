const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_all_pronouns } = require("../sentence_generator.js");

exports.data = new SlashCommandBuilder()
	.setName("try-all")
	.setDescription("Try all pronouns!")
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try.")
			.setRequired(false)
	);

exports.response = async function(interaction) {
	interaction.reply(make_all_pronouns(interaction.options.getString("name"), false));
}

exports.doc = `Try out using all pronouns. Just optionally enter a name and the bot will give you some example sentences.`;