const { PermissionsBitField, SlashCommandBuilder, ChannelType } = require('discord.js');
const gemini = require('../models/gemini'); // Importa o modelo do banco de dados para salvar as informações.

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setchannel-ia')
    .setDescription('Permite configurar canais para que a IA responda.')
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal do Chat IA')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),
  async execute(interaction) {
    // Verifica se o usuário tem permissão de administrador.
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'Somente administradores podem usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal'); // Obtém o canal selecionado na interação.

    try {
      // Busca no banco de dados por um registro da guilda atual.
      let data = await gemini.findOne({ GuildId: interaction.guild.id });
      if (!data) {
        // Se não houver registro, cria um novo.
        data = await gemini.create({
          GuildId: interaction.guild.id,
          ChannelId: channel.id,
        });
        return interaction.reply({ content: `Canal ${channel} adicionado como permitido para a IA.` });
      } else {
        // Se já houver um registro, atualiza o canal permitido.
        data.ChannelId = channel.id;
        await data.save();
        return interaction.reply({ content: `Canal ${channel} atualizado como permitido para a IA.` });
      }
    } catch (error) {
      console.error(error); // Loga o erro no console para depuração.
      return interaction.reply({ content: 'Ocorreu um erro ao configurar o canal.', ephemeral: true });
    }
  },
};