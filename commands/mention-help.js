"use strict";

import config from "../config.json" assert { type: "json" };

import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { delete_row } from "../shared.js";

const helpEmbed = new EmbedBuilder()
	.setColor("#FF8758")
	.setTitle("Pronoun Bot - @mention Guide")
	.setDescription("Welcome to the @mention command guide! This command works a bit differently to the others. You can activate it by starting your message with '<@" + config.client_id + ">' and having each option on a new line. For example:\n> <@" + config.client_id + ">\n> Name: Iota\n> Pronouns: she/her\n> Pronouns: they/them\nHowever there are many more ways to use this command which will be described below:")
	.setAuthor({ name: "Aurillium", iconURL: "https://avatars.githubusercontent.com/u/57483028", url: "https://github.com/Aurillium" })
	.addFields(
		{name: "Name Field", value: "Here you can put a name or list of names to use, separated by commas or slashes (',' or '/'). If you don't want to separate your names like this you can just add this field multiple times, and if you don't know what name you want you don't have to include it at all. The field name can also be shortened to 'n'."},
		{name: "Pronoun Field", value: "Here you add your pronoun sets. These are separated by commas or spaces (',' or ' '). Once again, you can use this field multiple times or not at all if you have no pronouns. You can also use these special options:\n> `all`/`a`: All pronouns\n> `random`/`r`: A random set\n> `none`/`n`: No pronouns. This field name can be shortened to 'p'."},
		{name: "Plural Field", value: "Whether or not the pronouns are plural. Unfortunately at the moment either all your pronouns must be plural or none of them. The values you can give here are `true` (`t`), `false` (`f`), `yes` (`y`), or `no` (`n`). This field name can be shortened to 'pl'."},
		{name: "Final Notes", value: "All of these options can be either uppercase or lowercase, and some may be more flexible than this command tells you, but these are the important points. Now go! Test your pronouns!"}
	);

export const data = new SlashCommandBuilder()
	.setName('mention-help')
	.setDescription('Displays help on the @mention command!');

export async function response(interaction) {
	await interaction.reply({embeds: [helpEmbed], components: [delete_row]});
}

export const testing = false;
export const doc = `Get help with the @mention command`