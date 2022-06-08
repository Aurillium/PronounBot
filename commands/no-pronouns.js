const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_sentences } = require("../sentence_generator.js");

exports.data = new SlashCommandBuilder()
	.setName("try-none")
	.setDescription("Try out using no pronouns!")
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try.")
			.setRequired(true)
	);

exports.response = async function(interaction) {
	interaction.reply(make_sentences(null, null, null, null, null, interaction.options.getString("name"), false));
}
