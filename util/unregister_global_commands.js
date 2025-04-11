"use_strict";

import config from "../config.json" with { type: "json" };

import { stamp_console, client_id } from "../shared.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "node:fs";

stamp_console("UTIL");

const rest = new REST({ version: "9" }).setToken(config.token);
const REGISTERED_COMMANDS_FILE = "env/registered_commands.txt";

// Anonymous async function which immediately gets called
// Used to allow us to use async methods
(async () => {
	try {
		console.log("Started unloading global slash commands...");

		// Read command ID file and split lines
		const data = fs.readFileSync(REGISTERED_COMMANDS_FILE, "utf8");
		const lines = data.trim().split("\n");

		// Loop over each line to unregister
		for (const line of lines) {
			// Get command name and ID
			let [name, id] = line.split(": ");
			// Send API request to delete the command
			await rest.delete(Routes.applicationCommand(client_id, id));

			console.log(`- Unregistered '${name}'.`);
		}
		fs.rmSync(REGISTERED_COMMANDS_FILE)

		console.log('Success!');
	} catch (error) {
		console.error(error);
	}
    // You must hate the word 'command' now
    // But it's done
})();
// Command
