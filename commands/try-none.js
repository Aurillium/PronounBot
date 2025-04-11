"use strict";

import { MessageFlags } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { generate_sentences } from "../engine.js";
import { delete_row, name_length_error } from "../shared.js";

export const data = new SlashCommandBuilder()
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

export async function response(interaction, db) {
	const name = interaction.options.getString("name");
	if (name.length > 50) {
		await interaction.reply({flags: MessageFlags.Ephemeral, embeds: [name_length_error]});
		return;
	}
	const hidden = interaction.options.getBoolean("hidden") ?? false;
	await interaction.reply({content: await generate_sentences([], [name], db), flags: hidden ? MessageFlags.Ephemeral : 0, components: hidden ? [] : [delete_row]});
}

export const testing = false;
export const doc = `Try out using no pronouns. All you need to specify is a name and the bot will give you some example sentences.`;
