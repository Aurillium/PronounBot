"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { generate_sentences } = require("../engine.js");
const { delete_row, name_length_error, pronoun_length_error } = require("../shared.js");

exports.data = new SlashCommandBuilder()
	.setName("try-noun")
	.setDescription("Try noun pronouns!")
	.addStringOption(option =>
		option.setName("noun")
			.setDescription("The noun to base the pronouns on.")
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
	const noun = interaction.options.getString("noun");
	const name = interaction.options.getString("name");
	if (noun.length > 20) {
		await interaction.reply({ephemeral: true, embeds: [pronoun_length_error]});
		return;
	}
	if (name !== null && name.length > 50) {
		await interaction.reply({ephemeral: true, embeds: [name_length_error]});
		return;
	}
	const hidden = interaction.options.getBoolean("hidden") ?? false;
	await interaction.reply({content: generate_sentences([[noun, noun, noun + "'s", noun + "'s", noun + "self", false]], [name], db), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

exports.doc = `Try out a set of noun pronouns. Just add a noun and optionally a name and you're set!`;