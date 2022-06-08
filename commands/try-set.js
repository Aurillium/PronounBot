const { SlashCommandBuilder } = require('@discordjs/builders');

exports.data = new SlashCommandBuilder()
	.setName("tryset")
	.setDescription("Tries out a pronoun set!")
	.addStringOption(option =>
		option.setName("set")
			.setDescription("The pronoun set in the form specified in `/help`")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try (optional)")
			.setRequired(false)
	);

exports.response = async function(interaction) {
	// To be implemented
}
