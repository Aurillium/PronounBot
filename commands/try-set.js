const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_sentences } = require("../sentence_generator.js");
const { delete_row } = require("../shared.js");

exports.data = new SlashCommandBuilder()
	.setName("try-set")
	.setDescription("Tries out a pronoun set!")
	.addStringOption(option =>
		option.setName("set")
			.setDescription("The pronoun set in the form specified in `/help`")
			.setRequired(true)
	)
	.addStringOption(option =>
		option.setName("name")
			.setDescription("The name you'd like to try (optional).")
			.setRequired(false)
	)
	.addBooleanOption(option =>
		option.setName("plural")
			.setDescription("Whether the pronoun set is plural or singular (default singular).")
			.setRequired(false)
	).addBooleanOption(option =>
		option.setName("hidden")
			.setDescription("Make the message only visible to you.")
			.setRequired(false)
	);

exports.response = async function(interaction) {
	let set = interaction.options.getString("set").split("/");
	var subjective, objective, possessive, second_possessive, reflexive;
	if (set.length == 4) {
		subjective = set[0];
		objective = set[1];
		possessive = set[2];
		second_possessive = set[2];
		reflexive = set[3];
	} else if (set.length == 5) {
		subjective = set[0];
		objective = set[1];
		possessive = set[2];
		second_possessive = set[3];
		reflexive = set[4];
	} else {
		interaction.reply({content: "Make sure your pronouns are in the form 'subjective/objective/possessive/possessive/reflexive' or 'subjective/objective/possessive/reflexive' (`/help` for more information)", ephemeral: true});
		return;
	}
	let name = interaction.options.getString("name");
	let plural = interaction.options.getBoolean("plural") ?? false;
	let hidden = interaction.options.getBoolean("hidden") ?? false;
	interaction.reply({content: make_sentences(subjective, objective, possessive, second_possessive, reflexive, name, plural), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

exports.doc = `Try out a set of pronouns in the form of 'subjective/objective/possessive/possessive/reflexive' or 'subjective/objective/possessive/reflexive', then optionally add a name and tell the bot if the pronouns are plural.`;