"use strict";

import { SlashCommandBuilder } from '@discordjs/builders';
import { generate_sentences } from "../engine.js";
import { delete_row, name_length_error } from "../shared.js";

export const data = new SlashCommandBuilder()
	.setName("try-random")
	.setDescription("Tries out a random pronoun set!")
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try (optional).")
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

	let db_sets = await db.async_query("SELECT Subjective, Objective, Possessive, Possessive2, Reflexive, Plural FROM Sets");
	let row = db_sets[Math.floor(Math.random() * db_sets.length)];

	let response = `The set I've chosen for you is **${row.Subjective}/${row.Objective}/${row.Possessive}/${row.Possessive2}/${row.Reflexive}**, how does this look?`;
	await interaction.reply({content: await generate_sentences([[row.Subjective, row.Objective, row.Possessive, row.Possessive2, row.Reflexive, row.Plural]], name ? [name] : [], db, response), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

export const testing = false;
export const doc = `Try out a set of pronouns by specifying one of each type of pronoun in a set, then optionally add a name and whether the pronouns are plural or singular.`;