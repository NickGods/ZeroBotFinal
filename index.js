// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { connectDB } = require('./utils/db');
const fs = require('fs');
const path = require('path');

// Carrega o arquivo config.json para obter os IDs dos desenvolvedores
const config = require('./config.json');

// Verifica se o token foi carregado corretamente
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Token do Discord não encontrado. Verifique o arquivo .env.');
  process.exit(1); // Encerra a execução se o token não for encontrado
}

// Cria uma nova instância do cliente Discord com as intenções necessárias
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Configura a coleção de comandos
client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Carrega os comandos dos arquivos e os adiciona à coleção de comandos do cliente
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());  // Registra os comandos para a API
}

// Função para verificar se o autor da mensagem é um desenvolvedor
function isDeveloper(userId) {
  return config.devs.includes(userId);
}

// Evento que dispara quando o bot está pronto
client.once('ready', async () => {
  console.log('O bot está pronto!');
  connectDB();

  // Registrar comandos
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Iniciando registro dos comandos slash...');

    // Para comandos globais:
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

    // Se preferir registrar comandos apenas em um servidor específico, use este código:
    // const guildId = 'SEU_GUILD_ID';  // Substitua pelo ID do seu servidor
    // await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands });

    console.log('Comandos registrados com sucesso.');
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
});

// Evento que dispara quando uma interação é criada
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Erro ao executar comando:', error);
    await interaction.reply({ content: 'Houve um erro ao executar o comando.', ephemeral: true });
  }
});

// Evento para verificar se a mensagem foi enviada por um desenvolvedor
client.on('messageCreate', async message => {
  if (message.author.bot) return; // Ignora mensagens de bots

  // Verifica se o autor da mensagem é um desenvolvedor
  if (isDeveloper(message.author.id)) {
    console.log(`Mensagem de desenvolvedor detectada: ${message.content}`);
    // Aqui você pode implementar qualquer lógica especial para desenvolvedores
  }
});

// Carrega o módulo de IA (presumindo que utils/ai.js existe e exporta uma função)
require('./utils/ai')(client);

// Faz login no bot usando o token carregado do arquivo .env
client.login(token)
  .then(() => {
    console.log('Bot logado com sucesso!');
  })
  .catch(error => {
    console.error('Erro ao fazer login:', error);
  });