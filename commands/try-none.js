"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { generate_sentences } = require("../engine.js");
const { delete_row, name_length_error } = require("../shared.js");

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

exports.response = async function(interaction, db) {
	const name = interaction.options.getString("name");
	if (name.length > 50) {
		await interaction.reply({ephemeral: true, embeds: [name_length_error]});
		return;
	}
	const hidden = interaction.options.getBoolean("hidden") ?? false;
	await interaction.reply({content: generate_sentences([], [name], db), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

exports.doc = `Try out using no pronouns. All you need to specify is a name and the bot will give you some example sentences.`;