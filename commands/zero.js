// commands/zero.js

module.exports = {
  data: {
    name: 'zero',
    description: 'Responde a pergunta do usuário',  // Descrição do comando
    type: 'CHAT_INPUT',  // Tipo do comando (usaremos chat input para interações no chat)
  },
  async execute(interaction) {
    // Verificar se o comando é chamado no formato !Zero "sua pergunta"
    const question = interaction.options.getString('pergunta');
    
    if (!question) {
      return interaction.reply('Você precisa me fazer uma pergunta após o comando !Zero.');
    }

    // Lógica de resposta com base no conteúdo da pergunta
    let response = '';

    if (question.includes('como') || question.includes('o que')) {
      response = 'Tsc, você quer saber demais... mas tudo bem, eu vou responder: ' + question;
    } else if (question.includes('por que')) {
      response = 'Você realmente quer saber por que, hum? Tá bom, vou te responder: ' + question;
    } else {
      response = 'Só isso? Bem, a resposta é: ' + question;
    }

    // Respondendo a pergunta
    await interaction.reply(response);
  },
};