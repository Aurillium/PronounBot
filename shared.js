"use strict";

import config from "./config.json" assert { type: "json" };

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createHash } from 'crypto';

import {default as console_stamp} from "console-stamp";

const db_salt = Buffer.from(config.database.salt, "hex");

export const client_id = Buffer.from(config.token.split(".")[0], "base64url").toString();

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export const delete_row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
                    .setCustomId("delete_try")
					.setLabel("Delete")
                    .setEmoji("🗑️")
					.setStyle(ButtonStyle.Danger),
			);

export function message_embed(description, colour="#FF0000") {
	return new EmbedBuilder()
		.setColor(colour)
		.setDescription(description);
}

export function hash(content) {
	return createHash('sha256').update(content).update(db_salt).digest();
}

export async function server_count(client) {
	let results = await client.shard.fetchClientValues('guilds.cache.size');
	return results.reduce((acc, guildCount) => acc + guildCount, 0);
}

export function stamp_console(proc) {
	console_stamp(console, {
		format: config.testing_mode ? ':date(dd/mm/yy HH:MM:ss.l) [' + proc + ']' : ':date(dd/mm/yy HH:MM:ss) [' + proc + ']' 
	});
}

export const pronoun_length_error = message_embed("Due to Discord limitations, we can't support pronouns longer than 20 characters");
export const name_length_error = message_embed("Due to Discord limitations, we can't support names longer than 50 characters");