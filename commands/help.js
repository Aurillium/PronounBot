const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const helpEmbed = new MessageEmbed()
	.setColor("#FF8758")
	.setTitle("Pronoun Bot")
	.setDescription("Pronoun Bot is, as the name might suggest, a bot to help you test pronouns!")
	.setAuthor({ name: "Aurillium", iconURL: "https://avatars.githubusercontent.com/u/57483028", url: "https://github.com/Aurillium" })
	.addField("How to use it", "Use the `/try-set` command to try a pronoun set in the form of 'subjective/objective/possessive/possessive/reflexive' or 'subjective/objective/possessive/reflexive', or `/try` to enter a pronoun for each type, then add your name and whether the pronouns are plural or singular. The bot will give you back some example sentences using the name and pronouns you choose!")
	.addField("Pronoun sets", "If you need some help working out what I mean:\nA pronoun set is made from four or five different types of pronoun. These are:\n\n**Personal Subjective:** they, he, she, etc.\n**Personal Objective:** them, him, her, etc.\n**Personal Possessive:** their, his, her, etc.\n**Personal Possessive:** theirs, his, hers, etc.\n**Reflexive:** themself, himself, herself, etc.\n\nThese are often shown in the form 'subjective/objective/possessive/possessive/reflexive', 'subjective/objective/possessive/reflexive', or for better known pronoun sets; 'subjective/objective'\n\nPronouns can also be singular or plural, which affects the grammar they use. For example, he/him and she/her are singular, but they/them is plural\nYou would say 'he is walking his dog' and 'they are walking their dog' but not 'they is walking their dog' or 'he are walking his dog'\n\nThis bot accepts the first two set formats of pronouns, but you can also specify pronouns individually by their types.")
	.addField("Credits", "The bot programmed by [Aurillium](https://github.com/Aurillium) and the sentences were created by Lune.");

exports.data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Displays help on the bot and pronouns!');

exports.response = async function(interaction) {
	interaction.reply({embeds: [helpEmbed]});
}
