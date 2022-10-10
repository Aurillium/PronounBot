"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_all_pronouns } = require("../engine.js");
const { delete_row, name_length_error } = require("../shared.js");

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

exports.response = async function(interaction, db) {
	const name = interaction.options.getString("name");
	if (name !== null && name.length > 50) {
		await interaction.reply({ephemeral: true, embeds: [name_length_error]});
		return;
	}
	const hidden = interaction.options.getBoolean("hidden") ?? false;
	await interaction.reply({content: make_all_pronouns(name, false, db), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

exports.doc = `Try out using all pronouns. Just optionally enter a name and the bot will give you some example sentences.`;