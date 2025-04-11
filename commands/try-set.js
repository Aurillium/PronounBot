"use strict";

import { MessageFlags } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { generate_sentences, expand_set } from "../engine.js";
import { delete_row, pronoun_length_error } from "../shared.js";

export const data = new SlashCommandBuilder()
	.setName("try-set")
	.setDescription("Tries out a pronoun set!")
	.addStringOption(option =>
		option.setName("set")
			.setDescription("The pronoun set in the form specified in `/help`")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try (optional).")
			.setRequired(false)
	).addBooleanOption(option =>
		option.setName("plural")
			.setDescription("Whether the pronoun set is plural or singular (default singular).")
			.setRequired(false)
	).addBooleanOption(option =>
		option.setName("hidden")
			.setDescription("Make the message only visible to you.")
			.setRequired(false)
	);

export async function response(interaction, db) {
	let set = expand_set(interaction.options.getString("set"));
	if (set === null) {
		await interaction.reply({content: "Make sure your pronouns are in the form 'subjective/objective/possessive/possessive/reflexive' or 'subjective/objective/possessive/reflexive' (`/help` for more information)", flags: MessageFlags.Ephemeral});
		return;
	}
	if (set[0].length > 20 || set[1].length > 20 || set[2].length > 20 || set[3].length > 20 || set[4].length > 20) {
		await interaction.reply({flags: MessageFlags.Ephemeral, embeds: [pronoun_length_error]});
		return;
	}
	const name = interaction.options.getString("name");
	if (name !== null && name.length > 50) {
		await interaction.reply({flags: MessageFlags.Ephemeral, embeds: [name_length_error]});
		return;
	}
	const plural = interaction.options.getBoolean("plural") ?? set[5];
	const hidden = interaction.options.getBoolean("hidden") ?? false;
	await interaction.reply({content: await generate_sentences([[set[0], set[1], set[2], set[3], set[4], plural]], name ? [name] : [], db), flags: hidden ? MessageFlags.Ephemeral : 0, components: hidden ? [] : [delete_row]});
}

export const testing = false;
export const doc = `Try out a set of pronouns in the form of 'subjective/objective/possessive/possessive/reflexive' or 'subjective/objective/possessive/reflexive', then optionally add a name and tell the bot if the pronouns are plural.`;