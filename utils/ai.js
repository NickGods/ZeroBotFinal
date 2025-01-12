require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const gemini = require('../models/gemini');
const fs = require('fs');
const path = require('path');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const messageHistory = new Map();

module.exports = client => {
  client.on('messageCreate', async message => {
    if (message.author.bot) return;

    try {
      const data = await gemini.findOne({ GuildId: message.guildId });
      if (!data || message.channel.id !== data.ChannelId) return;

      const API_KEY = process.env.GEMINI_API_KEY; // A chave da API do Gemini
      const MODEL = 'gemini-pro'; // Modelo a ser usado (ajuste conforme necessário)

      const ai = new GoogleGenerativeAI({ apiKey: API_KEY }); // Passando a chave para o cliente AI
      const model = ai.getGenerativeModel({ model: MODEL });

      const botMentioned = message.mentions.has(client.user);
      const isReplyToBot = message.reference && (await message.fetchReference()).author.id === client.user.id;

      if (!botMentioned && !isReplyToBot) return;

      message.channel.sendTyping();

      const personalityFilePath = path.join(__dirname, '../personality.txt');
      const personalityContent = await readFileAsync(personalityFilePath, 'utf-8');
      const personalityLines = personalityContent.trim();

      let channelHistory = messageHistory.get(message.channel.id) || [];

      channelHistory.push({
        author: message.author.id,
        content: message.cleanContent,
      });

      channelHistory = channelHistory.slice(-10); // Mantém as últimas 10 mensagens
      messageHistory.set(message.channel.id, channelHistory);

      const contextMessages = channelHistory
        .map(msg => `<@${msg.author}>: ${msg.content}`)
        .join('\n');

      let prompt = `
        ${personalityLines}
        
        Contexto de mensagens anteriores:
        ${contextMessages}
        
        Instruções:
        1. Cumprimente o usuário: <@${message.author.id}> de forma fria, como se não se importasse muito.
        2. Responda de forma direta e concisa, mantendo a personalidade fria e tsundere.
        3. Se o usuário perguntar a mesma coisa várias vezes, mostre impaciência. Não tenha medo de deixar isso claro.
        4. Responda com menos de 2000 caracteres.
        5. Use emojis/kaomojis apenas se for apropriado e se encaixar com a atitude fria e tsundere.

        Mensagem do usuário: ${message.cleanContent.replace(/<@!?\d+>/g, "").trim()}

        Resposta:`;

      let generatedText = '';
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const { response } = await model.generateContent(prompt);
          generatedText = response.text().trim();
          break;
        } catch (error) {
          if (error.message.includes('SAFETY')) {
            attempts++;
            prompt += '\n\nPor favor, gere uma resposta mais apropriada e segura.';
          } else {
            throw error;
          }
        }
      }

      if (generatedText.length === 0) {
        generatedText = 'Tsc, não consegui gerar uma resposta adequada. Não sabe reformular a pergunta?';
      }

      const finalResponse = generatedText.length > 2000
        ? generatedText.substring(0, 1997) + '...'
        : generatedText;

      await message.reply({
        content: finalResponse,
        allowedMentions: { parse: ['everyone', 'roles', 'users'] },
      });
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
      await message.reply('Tsc, algo deu errado. Tente de novo mais tarde.');
    }
  });
  client.login(process.env.DISCORD_TOKEN);
};