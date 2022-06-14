const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

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