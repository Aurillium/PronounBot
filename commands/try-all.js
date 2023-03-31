"use strict";

import { SlashCommandBuilder } from '@discordjs/builders';
import { generate_sentences } from "../engine.js";
import { delete_row, name_length_error } from "../shared.js";

export const data = new SlashCommandBuilder()
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

export async function response(interaction, db) {
	const name = interaction.options.getString("name");
	if (name !== null && name.length > 50) {
		await interaction.reply({ephemeral: true, embeds: [name_length_error]});
		return;
	}
	const hidden = interaction.options.getBoolean("hidden") ?? false;

	// Basically what we're doing here is selecting all the pronouns we have from the database, processing them, and throwing them into the function
	let db_sets = await db.async_query("SELECT Subjective, Objective, Possessive, Possessive2, Reflexive, Plural FROM Sets");
	let sets = [];
	for (let row of db_sets) {
		sets.push([row.Subjective, row.Objective, row.Possessive, row.Possessive2, row.Reflexive, row.Plural]);
	}

	await interaction.reply({content: await generate_sentences(sets, name ? [name] : [], db), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

export const doc = `Try out using all pronouns. Just optionally enter a name and the bot will give you some example sentences.`;