const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_sentences } = require("../sentence_generator.js");

exports.data = new SlashCommandBuilder()
	.setName("try")
	.setDescription("Tries out a pronoun set!")
	.addStringOption(option =>
		option.setName("subjective")
			.setDescription("The subjective personal pronoun.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("objective")
			.setDescription("The objective personal pronoun.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("possessive")
			.setDescription("The possessive personal pronoun.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("reflexive")
			.setDescription("The reflexive personal pronoun.")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("second_possessive")
			.setDescription("The second possessive personal pronoun.")
			.setRequired(false)
	)
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try (optional).")
			.setRequired(false)
	)
	.addBooleanOption(option =>
		option.setName("plural")
			.setDescription("Whether the pronoun set is plural or singular.")
			.setRequired(false)
	);

exports.response = async function(interaction) {
	let subjective = interaction.options.getString("subjective");
	let objective = interaction.options.getString("objective");
	let possessive = interaction.options.getString("possessive");
	let reflexive = interaction.options.getString("reflexive");
	let second_possessive = interaction.options.getString("second_possessive") ?? possessive;
	let name = interaction.options.getString("name");
	let plural = interaction.options.getBoolean("plural") ?? false;
	interaction.reply(make_sentences(subjective, objective, possessive, second_possessive, reflexive, name, plural));
}
