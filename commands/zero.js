const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

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

    // Lê a personalidade do bot a partir do arquivo .txt
    const personalidade = fs.readFileSync('personalidade.txt', 'utf-8');

    // Realiza a requisição para a IA da Gemine
    try {
      const response = await axios.post('API_URL_DA_GEMINE', {
        question,
        personality: personalidade,
      });

      const resposta = response.data.answer;  // Supondo que a resposta vem nesse formato

      // Envia a resposta para o usuário
      await interaction.reply(`Você perguntou: "${question}". E a resposta é: "${resposta}"`);
    } catch (error) {
      console.error('Erro ao interagir com a IA da Gemine:', error);
      await interaction.reply('Desculpe, não consegui processar a sua pergunta no momento.');
    }
  },
};