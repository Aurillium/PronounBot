const { SlashCommandBuilder } = require('@discordjs/builders');

exports.data = new SlashCommandBuilder()
	.setName('echo')
	.setDescription('Replies with your input!')
	.addStringOption(option =>
		option.setName('input')
			.setDescription('The input to echo back')
			.setRequired(true));

exports.response = async function(interaction) {
	let string = interaction.options.getString('input');
	interaction.reply(`String: ${string}`);
}
