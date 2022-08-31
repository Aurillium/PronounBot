"use strict";

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

exports.sleep = ms => new Promise(r => setTimeout(r, ms));

exports.delete_row = new MessageActionRow()
			.addComponents(
				new MessageButton()
                    .setCustomId("delete_try")
					.setLabel("Delete")
                    .setEmoji("🗑️")
					.setStyle("DANGER"),
			);

exports.message_embed = function(description, colour="#FF0000") {
	return new MessageEmbed()
		.setColor(colour)
		.setDescription(description);
}

exports.expand_set = function(raw_set) {
	const he_him = ["he", "him", "his", "his", "himself"];
	const she_her = ["she", "her", "her", "hers", "herself"];
	const they_them = ["they", "them", "their", "their", "themself"];
	if (raw_set.length === 1) {
		if (raw_set[0] === "he") {
			return he_him;
		} else if (raw_set[0] === "she") {
			return she_her;
		} else if (raw_set[0] === "they") {
			return they_them;
		} else {
			return null;
		}
	} else if (raw_set.length === 2) {
		if (raw_set[0] === "he" && raw_set[1] === "him") {
			return he_him;
		} else if (raw_set[0] === "she" && raw_set[1] === "her") {
			return she_her;
		} else if (raw_set[0] === "they" && raw_set[1] === "them") {
			return they_them;
		} else {
			return null;
		}
	} else if (raw_set.length === 4) {
		return [raw_set[0], raw_set[1], raw_set[2], raw_set[2], raw_set[3]];
	} else if (raw_set.length === 5) {
		return raw_set;
	} else {
		return null;
	}
}

exports.pronoun_length_error = exports.message_embed("Due to Discord limitations, we can't support pronouns longer than 20 characters");
exports.name_length_error = exports.message_embed("Due to Discord limitations, we can't support names longer than 50 characters");