"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { generate_sentences } = require("../engine.js");
const { delete_row, name_length_error, pronoun_length_error } = require("../shared.js");

exports.data = new SlashCommandBuilder()
	.setName("try")
	.setDescription("Tries out a pronoun set!")
	.addStringOption(option =>
		option.setName("subjective")
			.setDescription("The subjective personal pronoun.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("objective")
			.setDescription("The objective personal pronoun.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("possessive")
			.setDescription("The possessive personal pronoun.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("reflexive")
			.setDescription("The reflexive personal pronoun.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("second_possessive")
			.setDescription("The second possessive personal pronoun.")
			.setRequired(false)
	)
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try (optional).")
			.setRequired(false)
	)
	.addBooleanOption(option =>
		option.setName("plural")
			.setDescription("Whether the pronoun set is plural or singular (default singular).")
			.setRequired(false)
	).addBooleanOption(option =>
		option.setName("hidden")
			.setDescription("Make the message only visible to you.")
			.setRequired(false)
	);

exports.response = async function(interaction, db) {
	const subjective = interaction.options.getString("subjective");
	const objective = interaction.options.getString("objective");
	const possessive = interaction.options.getString("possessive");
	const reflexive = interaction.options.getString("reflexive");
	const second_possessive = interaction.options.getString("second_possessive") ?? possessive;
	if (subjective.length > 20 || objective.length > 20 || possessive.length > 20 || second_possessive.length > 20 || reflexive.length > 20) {
		await interaction.reply({ephemeral: true, embeds: [pronoun_length_error]});
		return;
	}
	const name = interaction.options.getString("name");
	if (name !== null && name.length > 50) {
		await interaction.reply({ephemeral: true, embeds: [name_length_error]});
		return;
	}
	const plural = interaction.options.getBoolean("plural") ?? false;
	const hidden = interaction.options.getBoolean("hidden") ?? false;
	await interaction.reply({content: await generate_sentences([[subjective, objective, possessive, second_possessive, reflexive, plural]], name ? [name] : [], db), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

exports.doc = `Try out a set of pronouns by specifying one of each type of pronoun in a set, then optionally add a name and whether the pronouns are plural or singular.`;