const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_sentences } = require("../sentence_generator.js");
const { delete_row } = require("../shared.js");

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
	).addBooleanOption(option =>
		option.setName("hidden")
			.setDescription("Make the message only visible to you.")
			.setRequired(false)
	);

exports.response = async function(interaction, db) {
	let noun = interaction.options.getString("noun");
	let hidden = interaction.options.getBoolean("hidden") ?? false;
	interaction.reply({content: make_sentences(noun, noun, noun + "'s", noun + "'s", noun + "self", interaction.options.getString("name"), false, db), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

exports.doc = `Try out a set of noun pronouns. Just add a noun and optionally a name and you're set!`;