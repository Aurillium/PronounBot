const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_sentences } = require("../sentence_generator.js");

exports.data = new SlashCommandBuilder()
	.setName("try-noun")
	.setDescription("Try noun pronouns!")
	.addStringOption(option =>
		option.setName("noun")
			.setDescription("The noun to base the pronouns off of.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try.")
			.setRequired(false)
	);

exports.response = async function(interaction) {
	let noun = interaction.options.getString("noun");
	interaction.reply(make_sentences(noun, noun, noun + "s", noun + "s", noun + "self", interaction.options.getString("name"), false));
}

exports.doc = `Try out using no pronouns. All you need to specify is a name and the bot will give you some example sentences.`;