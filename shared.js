"use strict";

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { database } = require("./config.json");
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

exports.pronoun_length_error = exports.message_embed("Due to Discord limitations, we can't support pronouns longer than 20 characters");
exports.name_length_error = exports.message_embed("Due to Discord limitations, we can't support names longer than 50 characters");