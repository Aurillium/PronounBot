"use strict";

import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
	.setName("crash")
	.setDescription("Crash this shard!");

export async function response(interaction, db) {
	await interaction.reply({content: "One crash coming right up!"});
	throw new Error("Intentional crash");
}

export const testing = true;
export const doc = `Crash this shard.`;