"use strict";

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { client_id } = require('../config.json');

const helpEmbed = new MessageEmbed()
	.setColor("#FF8758")
	.setTitle("Pronoun Bot")
	.setDescription("Pronoun Bot is, as the name might suggest, a bot to help you test pronouns!")
	.setAuthor({ name: "Aurillium", iconURL: "https://avatars.githubusercontent.com/u/57483028", url: "https://github.com/Aurillium" })
	.addFields(
		{name: "How to use it", value: "Just use one of the 'try' commands to test out a set of pronouns. The command should tell you what you need, but in case you want a description of each command and what it does, type `/commands` for details on all of them. Alternatively, use:"},
		{name: "@mention Command", value: "Pronoun Bot has a feature that allows you to @mention the bot (start your message with <@" + client_id + ">) to run a command that gives you much greater flexibility than the others, but you might need more help to use it. You can learn more about this with `/mention-help`"},
		{name: "Pronoun Sets", value: "If you need some help working out what I mean:\nA pronoun set is made from four or five different types of pronoun. These are:\n\n**Personal Subjective:** they, he, she, etc.\n**Personal Objective:** them, him, her, etc.\n**Personal Possessive:** their, his, her, etc.\n**Personal Possessive:** theirs, his, hers, etc.\n**Reflexive:** themself, himself, herself, etc.\n\nThese are often shown in the form 'subjective/objective/possessive/possessive/reflexive', 'subjective/objective/possessive/reflexive', or for better known pronoun sets; 'subjective/objective'\n\nPronouns can also be singular or plural, which affects the grammar they use. For example, he/him and she/her are singular, but they/them is plural\nYou would say 'he is walking his dog' and 'they are walking their dog' but not 'they is walking their dog' or 'he are walking his dog'\n\nThis bot accepts the first two set formats of pronouns, but you can also specify pronouns individually by their types."},
		{name: "Credits", value: "The bot programmed by [Aurillium](https://github.com/Aurillium) and the sentences were created by Lune."}
	);

exports.data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Displays help on the bot and pronouns!');

const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setURL("https://discord.gg/ZnRzV469rJ")
					.setLabel("Support Server")
					.setStyle("LINK"),
				new MessageButton()
					.setURL(`https://discord.com/api/oauth2/authorize?client_id=${client_id}&permissions=2147483648&scope=bot%20applications.commands`)
					.setLabel("Invite Link")
					.setStyle("LINK"),
			);

exports.response = async function(interaction) {
	await interaction.reply({embeds: [helpEmbed], components: [row]});
}

exports.doc = `Display information about the bot`