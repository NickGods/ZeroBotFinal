const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zero')
    .setDescription('Responde a sua pergunta com a inteligência do Zero!')
    .addStringOption(option => 
      option.setName('pergunta')
        .setDescription('A pergunta que você quer fazer ao Zero')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const question = interaction.options.getString('pergunta');

    // Verifique se a pergunta foi recebida
    if (!question) {
      return interaction.reply('Você precisa fazer uma pergunta!');
    }

    // Simula uma resposta (a lógica pode ser personalizada)
    const resposta = `Você perguntou: "${question}". E a resposta é: "A inteligência do Zero não tem uma resposta para isso."`;

    // Envia a resposta para o usuário
    await interaction.reply(resposta);
  },
};