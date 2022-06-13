const { MessageActionRow, MessageButton } = require('discord.js');

exports.delete_row = new MessageActionRow()
			.addComponents(
				new MessageButton()
                    .setCustomId("delete_try")
					.setLabel("Delete")
                    .setEmoji("🗑️")
					.setStyle("DANGER"),
			);