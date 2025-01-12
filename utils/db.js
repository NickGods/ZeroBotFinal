const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(mongodb+srv://nikolasoutblox:<nick1212>@zerobot.ajt4q.mongodb.net/?retryWrites=true&w=majority&appName=ZeroBot, {
    });
    console.log('Conectado a la base de datos MongoDB');
  } catch (error) {
    console.error('Error conectando a la base de datos MongoDB:', error);
    process.exit(1); 
  }
};

module.exports = { connectDB };
