"use strict";

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { database } = require("config.json");
const crypto = require('crypto');

const db_salt = Buffer.from(database.salt, "hex")

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

exports.hash = function(content) {
	return crypto.createHash('sha256').update(content).update(db_salt).digest();
}

function second_possessive(possessive) {
	const last_letter = possessive[possessive.length - 1];
	let possessive2;
	if (last_letter === "s" || last_letter === "z") {
		possessive2 = possessive;
	} else {
		possessive2 = possessive + "s";
	}
	return possessive2;
}

const he_him = ["he", "him", "his", "his", "himself"];
const she_her = ["she", "her", "her", "hers", "herself"];
const they_them = ["they", "them", "their", "theirs", "themself"];
const it_its = ["it", "it", "its", "its", "itself"];

exports.expand_set = function(raw_set) {
	if (raw_set.length === 1) {
		if (raw_set[0] === "he") {
			return he_him;
		} else if (raw_set[0] === "she") {
			return she_her;
		} else if (raw_set[0] === "they") {
			return they_them;
		} else if (raw_set[0] === "it") {
			return it_its;
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
		} else if (raw_set[0] === "it" && (raw_set[1] === "it" || raw_set[1] === "its")) {
			return it_its;
		} else {
			return null;
		}
	} else if (raw_set.length === 3) {
		const possessive = raw_set[2];
		const possessive2 = second_possessive(possessive);
		return [raw_set[0], raw_set[1], possessive, possessive2, raw_set[1] + "self"]
	} else if (raw_set.length === 4) {
		const possessive = raw_set[2];
		const possessive2 = second_possessive(possessive);
		return [raw_set[0], raw_set[1], possessive, possessive2, raw_set[3]];
	} else if (raw_set.length === 5) {
		return raw_set;
	} else {
		return null;
	}
}

exports.pronoun_length_error = exports.message_embed("Due to Discord limitations, we can't support pronouns longer than 20 characters");
exports.name_length_error = exports.message_embed("Due to Discord limitations, we can't support names longer than 50 characters");