const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://nikolasoutblox:nick1212@zerobot.ajt4q.mongodb.net/?retryWrites=true&w=majority&appName=ZeroBot', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado à base de dados MongoDB');
  } catch (error) {
    console.error('Erro ao conectar à base de dados MongoDB:', error);
    process.exit(1); 
  }
};

module.exports = { connectDB };