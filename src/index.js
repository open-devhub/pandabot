require('dotenv').config();
const { Client, IntentsBitField, Partials } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');
const maskMongoUri = require('./utils/maskMongoUri');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error(
        'Missing MONGODB_URI in environment. Please set it in .env or environment variables.'
      );
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');

    mongoose.set('strictQuery', false);
    mongoose.connection.on('error', (err) => {
      console.error(
        'Mongoose connection error:',
        err && err.message ? err.message : err
      );
    });

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log('Connected to DB.');

    eventHandler(client);

    client.login(process.env.TOKEN).catch((err) => {
      console.error('Discord login error:', err);
    });

    client.on('error', console.error);
    client.on('shardError', console.error);
  } catch (err) {
    console.error(err);
  }
})();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
