export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Bot ishlayapti ✅");
    }

    try {
      const update = await request.json();

      // Telegram xabari
      if (update.message) {
        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";

        // /start
        if (text === "/start") {
          await sendMessage(env.BOT_TOKEN, chatId,
            "Assalomu alaykum! 👋\n\n" +
            "Sizning fikringiz biz uchun muhim.\n" +
            "Quyidagilardan birini tanlang:",
            {
              inline_keyboard: [
                [
                  { text: "📝 Shikoyat", callback_data: "complaint" },
                  { text: "💡 Taklif", callback_data: "suggestion" }
                ]
              ]
            }
          );

          return new Response("OK");
        }

        // Foydalanuvchi shikoyat/taklif yuborayotgan bo'lsa
        const state = await env.STATE.get(String(chatId));

        if (state === "complaint" || state === "suggestion") {
          const type = state === "complaint"
            ? "📝 SHIKOYAT"
            : "💡 TAKLIF";

          const username = message.from.username
            ? "@" + message.from.username
            : "Ko‘rsatilmagan";

          const name = [
            message.from.first_name || "",
            message.from.last_name || ""
          ].join(" ").trim();

          const adminText =
            "📩 YANGI MUROJAAT\n\n" +
            "Turi: " + type + "\n" +
            "👤 Ism: " + (name || "Ko‘rsatilmagan") + "\n" +
            "🔗 Telegram: " + username + "\n" +
            "🆔 ID: " + chatId + "\n\n" +
            "💬 Murojaat:\n" + text;

          await sendMessage(
            env.BOT_TOKEN,
            env.ADMIN_CHAT_ID,
            adminText
          );

          await env.STATE.delete(String(chatId));

          await sendMessage(
            env.BOT_TOKEN,
            chatId,
            "✅ Murojaatingiz qabul qilindi!\n\n" +
            "E'tiboringiz uchun rahmat. Murojaatingiz mas'ullarga yetkazildi."
          );

          return new Response("OK");
        }
      }

      // Tugma bosilganda
      if (update.callback_query) {
        const callback = update.callback_query;
        const chatId = callback.message.chat.id;
        const data = callback.data;

        if (data === "complaint" || data === "suggestion") {
          await env.STATE.put(
            String(chatId),
            data,
            { expirationTtl: 1800 }
          );

          const text = data === "complaint"
            ? "📝 Shikoyatingizni batafsil yozing:"
            : "💡 Taklifingizni yozing:";

          await sendMessage(
            env.BOT_TOKEN,
            chatId,
            text + "\n\nBekor qilish uchun /start ni bosing."
          );

          await answerCallback(
            env.BOT_TOKEN,
            callback.id
          );
        }

        return new Response("OK");
      }

      return new Response("OK");

    } catch (error) {
      return new Response("Error: " + error.message, {
        status: 500
      });
    }
  }
};


// Telegramga xabar yuborish
async function sendMessage(token, chatId, text, keyboard = null) {
  const body = {
    chat_id: chatId,
    text: text
  };

  if (keyboard) {
    body.reply_markup = keyboard;
  }

  await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );
}


// Tugma bosilganini Telegramga bildirish
async function answerCallback(token, callbackId) {
  await fetch(
    `https://api.telegram.org/bot${token}/answerCallbackQuery`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        callback_query_id: callbackId
      })
    }
  );
      }
