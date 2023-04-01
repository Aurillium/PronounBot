"use strict";

import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
	.setName("announcements")
	.setDescription("Manage Pronoun Bot's announcement channel!")
	.addChannelOption(option =>
		option.setName("channel")
			.setDescription("The channel to announce to.")
			.setRequired(false)
	).addBooleanOption(option =>
		option.setName("enabled")
			.setDescription("Whether announcments are enabled or disabled.")
			.setRequired(false)
	);

export async function response(interaction, db) {
    const channel = interaction.options.getChannel("channel");
    //await channel.send("Announcement channel is set!");
	await interaction.reply("This command is yet to be implemented...")
}

export const testing = false;