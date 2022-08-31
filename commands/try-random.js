const { SlashCommandBuilder } = require('@discordjs/builders');
const { make_sentences } = require("../sentence_generator.js");
const { delete_row, name_length_error } = require("../shared.js");

exports.data = new SlashCommandBuilder()
	.setName("try-random")
	.setDescription("Tries out a random pronoun set!")
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

exports.response = async function(interaction, db) {
	const name = interaction.options.getString("name");
	if (name.length > 50) {
		await interaction.reply({ephemeral: true, embeds: [name_length_error]});
		return;
	}
	const plural = interaction.options.getBoolean("plural") ?? false;
	const hidden = interaction.options.getBoolean("hidden") ?? false;
	if (plural) {
		statement = db.prepare("SELECT Subjective, Objective, Possessive, Possessive2, Reflexive FROM Sets");
	} else {
		statement = db.prepare("SELECT Subjective, Objective, Possessive, Possessive2, Reflexive FROM Sets WHERE Plural=0");
	}
	let rows = statement.all();
	let row = rows[Math.floor(Math.random() * rows.length)];
	let response = `The set I've chosen for you is **${row.Subjective}/${row.Objective}/${row.Possessive}/${row.Possessive2}/${row.Reflexive}**, how does this look?`;
	await interaction.reply({content: make_sentences(row.Subjective, row.Objective, row.Possessive, row.Possessive2, row.Reflexive, name, plural, db, response), ephemeral: hidden, components: hidden ? [] : [delete_row]});
}

exports.doc = `Try out a set of pronouns by specifying one of each type of pronoun in a set, then optionally add a name and whether the pronouns are plural or singular.`;