const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const helpEmbed = new MessageEmbed()
	.setColor("#FF8758")
	.setTitle("Pronoun Bot")
	.setDescription("Pronoun Bot is, as the name might suggest, a bot to help you test pronouns!")
	.addField("How to use it", "Use the `/try` command to try a pronoun set in the form of 'subjective/objective/possessive/possessive/reflective' or 'subjective/objective/possessive/reflective', or enter a pronoun for each type, then add your name. The bot will give you back some example sentences using the name and pronouns you choose!")
	.addField("Pronoun sets", "If you need some help working out what I mean:\nA pronoun set is made from four or five different types of pronoun. These are:\n\n**Personal Subjective:** they, he, she, etc.\n**Personal Objective:** them, him, her, etc.\n**Personal Possessive:** their, his, her, etc.\n**Personal Possessive:** theirs, his, her, etc.\n**Reflexive:** themself, himself, herself, etc.\n\nThese are often shown in the form 'subjective/objective/possessive/possessive/reflective', 'subjective/objective/possessive/reflective', or for better known pronoun sets; 'subjective/objective'\n\nThis bot accepts the first two set formats of pronouns, but you can also specify pronouns individually by their types.");

exports.data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Displays help on the bot and pronouns!');

exports.response = async function(interaction) {
	interaction.reply({embeds: [helpEmbed]});
}
