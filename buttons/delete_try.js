exports.response = async function(interaction) {
    if (interaction.message.interaction.user.id === interaction.user.id) {
        try {
            //console.log(interaction.message.interaction.user);
            await interaction.message.delete();
            await interaction.reply({content: "Deleted!", ephemeral: true});
        } catch (error) {
            if (error.message === "Missing Access") {
                await interaction.reply({content: "Missing access to channel.", ephemeral: true})
            } else {
                throw error;
            }
        }
    } else {
        await interaction.reply({content: "You can only delete commands you sent.", ephemeral: true});
    }
}