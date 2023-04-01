"use_strict";

import config from "../config.json" assert { type: "json" };

import { SlashCommandBuilder } from "@discordjs/builders";
import { stamp_console, client_id } from "../shared.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "node:fs";

stamp_console("UTIL");

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

const rest = new REST({ version: "9" }).setToken(config.token);
const REGISTERED_COMMANDS_FILE = "env/registered_commands.txt";

// Anonymous async function which immediately gets called
// Used to allow us to use async methods
(async () => {

    // Loop over each command file and add
	for (const file of commandFiles) {
		const command = await import("../commands/" + file);
        // Don't include testing commands in global commands
		if (!command.testing) {
			commands.push(command.data.toJSON());
		}
	}
	
    // Add `commands` command to command a command about commands
	commands.push(new SlashCommandBuilder().setName("commands").setDescription("Displays a list of commands!"));

	try {
		console.log("Started loading global slash commands...");

        // Upload all the commands
        const registered_commands = await rest.put(
            Routes.applicationCommands(client_id),
            { body: commands },
        );
        let registered_string = "";
        for (const command of registered_commands) {
            registered_string += command.name + ": " + command.id + "\n";
        }
        fs.writeFileSync(REGISTERED_COMMANDS_FILE, registered_string);

		console.log("Success!");
	} catch (error) {
		console.error(error);
	}
    // You must hate the word 'command' now
    // But it's done
})();
// Command