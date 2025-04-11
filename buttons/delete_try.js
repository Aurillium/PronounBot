"use strict";

import { MessageFlags } from 'discord.js';
import { message_embed } from "../shared.js";

export async function response(interaction, arg) {
    let allowed = false;
    if (interaction.message.interaction != undefined) {
        if (interaction.message.interaction.user.id === interaction.user.id) {
            allowed = true;
        }
    } else if (arg === interaction.user.id) {
        allowed = true;
    }
    if (allowed) {
        try {
            await interaction.message.delete();
            await interaction.reply({embeds: [message_embed("Message deleted!", "#00FF00")], flags: MessageFlags.Ephemeral});
        } catch (error) {
            if (error.message === "Missing Access") {
                await interaction.reply({embeds: [message_embed("Missing access to channel.", "#FF0000")], flags: MessageFlags.Ephemeral})
            } else {
                throw error;
            }
        }
    } else {
        await interaction.reply({embeds: [message_embed("You can only delete commands you sent.", "#FF0000")], flags: MessageFlags.Ephemeral});
    }
}