require('dotenv').config(); // Carregar variáveis de ambiente do .env
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

    // Lê a personalidade do bot a partir do arquivo personality.txt
    let personalidade;
    try {
      personalidade = fs.readFileSync('personality.txt', 'utf-8');
    } catch (err) {
      console.error('Erro ao ler o arquivo personality.txt:', err);
      return interaction.reply('Desculpe, houve um erro ao carregar a personalidade do bot.');
    }

    // Obtém a URL da API da Gemine a partir do .env
    const gemineApiUrl = process.env.GEMINE_API_URL;
    if (!gemineApiUrl) {
      console.error('API URL da Gemine não encontrada no arquivo .env');
      return interaction.reply('Desculpe, a API do Gemine não está configurada corretamente.');
    }

    // Realiza a requisição para a IA da Gemine
    try {
      const response = await axios.post(gemineApiUrl, {
        question,
        personality: personalidade,
      });

      // Supondo que a resposta da API venha no formato `{ answer: "resposta da IA" }`
      const resposta = response.data.answer;

      // Envia a resposta para o usuário
      await interaction.reply(`Você perguntou: "${question}". E a resposta é: "${resposta}"`);
    } catch (error) {
      console.error('Erro ao interagir com a IA da Gemine:', error);
      await interaction.reply('Desculpe, não consegui processar a sua pergunta no momento.');
    }
  },
};