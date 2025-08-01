require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Логика, если кто-то пишет /start (опционально)
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Всем привет! Меня зовут Геннадий Напоминалов. Я буду напоминать о репетиции раз в неделю. Пока я умею только это, но, если Сашке будет не лень, он под пиво добавит что-нибудь ещё"
  );
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `
Доступные команды:
/start - Приветствие и информация
/help - Список команд
/next - Узнать дату и время следующей репетиции
  `;
  bot.sendMessage(msg.chat.id, helpMessage);
});

bot.onText(/\/next/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Следующая репетиция — в субботу в 21:00. Не забудьте подготовиться!"
  );
});

// Еженедельное напоминание (каждую пятницу в 09:05)
cron.schedule(
  "05 9 * * 5",
  () => {
    bot.sendMessage(
      process.env.CHAT_ID,
      "📅 Напоминание: в субботу репетиция в 21:00! Если у кого-то поменялись планы, сообщите об этом"
    );
  },
  {
    timezone: "Europe/Moscow",
  }
);
