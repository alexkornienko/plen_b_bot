require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.setMyCommands([
  { command: "/start", description: "Приветствие и информация" },
  { command: "/help", description: "Список доступных команд" },
  { command: "/next", description: "Узнать дату и время следующей репетиции" },
  { command: "/sinya_yama", description: "Отменить репетицию на этой неделе" },
  {
    command: "/ya_trezv",
    description: "Вернуть напоминание на ближайшую репетицию",
  },
]);

let skipNextReminder = false;

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const welcomeText = `Всем привет! Меня зовут Геннадий Напоминалов.  
Я буду напоминать о репетиции раз в неделю.  

Пока я умею только это, но если Сашке будет не лень — он под пиво добавит что-нибудь ещё 🍻`;

  bot.sendMessage(chatId, welcomeText, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📅 Следующая репетиция", callback_data: "next" },
          { text: "❌ Отменить репетицию", callback_data: "sinya_yama" },
        ],
        [
          { text: "✅ Вернуть напоминание", callback_data: "ya_trezv" },
          { text: "ℹ️ Помощь", callback_data: "help" },
        ],
      ],
    },
  });
});

bot.onText(/\/help/, (msg) => {
  sendHelp(msg.chat.id);
});

bot.onText(/\/next/, (msg) => {
  sendNext(msg.chat.id);
});

bot.onText(/\/sinya_yama/, (msg) => {
  handleSinyaYama(msg.chat.id);
});

bot.onText(/\/ya_trezv/, (msg) => {
  handleYaTrezv(msg.chat.id);
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;

  switch (query.data) {
    case "help":
      sendHelp(chatId);
      break;
    case "next":
      sendNext(chatId);
      break;
    case "sinya_yama":
      handleSinyaYama(chatId);
      break;
    case "ya_trezv":
      handleYaTrezv(chatId);
      break;
  }

  bot.answerCallbackQuery(query.id);
});

function sendHelp(chatId) {
  const helpMessage = `
<b>Доступные команды:</b>
/start – Приветствие и информация  
/help – Список доступных команд  
/next – Узнать дату и время следующей репетиции  
/sinya_yama – Отменить ближайшее напоминание  
/ya_trezv – Вернуть напоминание на ближайшую репетицию
  `;
  bot.sendMessage(chatId, helpMessage, { parse_mode: "HTML" });
}

function sendNext(chatId) {
  bot.sendMessage(
    chatId,
    "Следующая репетиция — в субботу в 21:00. Не забудьте подготовиться!"
  );
}

function handleSinyaYama(chatId) {
  if (!skipNextReminder) {
    skipNextReminder = true;
    bot.sendMessage(
      chatId,
      "❌ Репетиция в эту субботу отменена. Участники попали в синюю яму."
    );
  } else {
    bot.sendMessage(
      chatId,
      "ℹ️ Напоминание уже отменено. Кожаный, тебе повторять надо?"
    );
  }
}

function handleYaTrezv(chatId) {
  if (skipNextReminder) {
    skipNextReminder = false;
    bot.sendMessage(
      chatId,
      "✅ Репетиция в эту субботу снова в силе. Участники протрезвели."
    );
  } else {
    bot.sendMessage(
      chatId,
      "ℹ️ Напоминание уже активно. Кожаный, тебе повторять надо?"
    );
  }
}

cron.schedule(
  "05 9 * * 5",
  () => {
    if (skipNextReminder) {
      console.log("⏭ Напоминание пропущено по запросу /sinya_yama");
      skipNextReminder = false;
      return;
    }

    bot.sendMessage(
      process.env.CHAT_ID,
      "📅 Напоминание: в субботу репетиция в 21:00! Если у кого-то поменялись планы, сообщите об этом."
    );
  },
  { timezone: "Europe/Moscow" }
);

cron.schedule(
  "00 21 * * 6",
  () => {
    if (skipNextReminder) {
      console.log("Напоминание восстановлено");
      skipNextReminder = false;
      return;
    }
  },
  { timezone: "Europe/Moscow" }
);
