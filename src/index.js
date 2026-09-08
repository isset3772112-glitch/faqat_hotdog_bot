export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("FAQAT HOTDOG bot ishlayapti ✅");
    }

    try {
      const update = await request.json();

      // =====================================================
      // TELEGRAM XABARI
      // =====================================================
      if (update.message) {
        const message = update.message;

        const chatId = message.chat.id;

        // Oddiy matn
        const text = message.text || "";

        // Rasm ostidagi yozuv
        const caption = message.caption || "";

        // Foydalanuvchi ma'lumotlari
        const username = message.from?.username
          ? "@" + message.from.username
          : "Ko‘rsatilmagan";

        const name = [
          message.from?.first_name || "",
          message.from?.last_name || ""
        ].join(" ").trim() || "Ko‘rsatilmagan";


        // =====================================================
        // /START
        // =====================================================
        if (text === "/start") {
          await sendMessage(
            env.BOT_TOKEN,
            chatId,
            "Assalomu alaykum! 👋🌭\n\n" +
            "FAQAT HOTDOG botiga xush kelibsiz!\n\n" +
            "Sizning fikringiz biz uchun muhim.\n" +
            "Quyidagilardan birini tanlang:",
            {
              inline_keyboard: [
                [
                  {
                    text: "📝 Shikoyat",
                    callback_data: "complaint"
                  },
                  {
                    text: "💡 Taklif",
                    callback_data: "suggestion"
                  }
                ]
              ]
            }
          );

          return new Response("OK");
        }


        // =====================================================
        // SALOMLASHISH
        // =====================================================
        const greetings = [
          "salom",
          "salom!",
          "salom.",
          "assalom",
          "assalom!",
          "assalomu alaykum",
          "assalomu alaykum!",
          "hello",
          "hello!",
          "hi",
          "hi!"
        ];

        if (greetings.includes(text.trim().toLowerCase())) {
          await sendMessage(
            env.BOT_TOKEN,
            chatId,
            "Va alaykum assalom! 👋🌭\n\n" +
            "FAQAT HOTDOG botiga xush kelibsiz!\n\n" +
            "Sizning fikringiz biz uchun muhim. " +
            "Shikoyat yoki taklifingizni yuborishingiz mumkin:",
            {
              inline_keyboard: [
                [
                  {
                    text: "📝 Shikoyat",
                    callback_data: "complaint"
                  },
                  {
                    text: "💡 Taklif",
                    callback_data: "suggestion"
                  }
                ]
              ]
            }
          );

          return new Response("OK");
        }


        // =====================================================
        // FOYDALANUVCHI HOLATINI TEKSHIRISH
        // =====================================================
        const state = await env.STATE.get(String(chatId));


        // =====================================================
        // SHIKOYAT YOKI TAKLIF QABUL QILISH
        // =====================================================
        if (state === "complaint" || state === "suggestion") {

          const type = state === "complaint"
            ? "📝 SHIKOYAT"
            : "💡 TAKLIF";


          // ===================================================
          // FOYDALANUVCHI HAQIDA MA'LUMOT
          // ===================================================
          const adminText =
            "📩 YANGI MUROJAAT\n\n" +
            "Turi: " + type + "\n" +
            "👤 Ism: " + name + "\n" +
            "🔗 Telegram: " + username + "\n" +
            "🆔 ID: " + chatId + "\n\n";


          // ===================================================
          // MATNLI MUROJAAT
          // ===================================================
          if (message.text) {

            await sendMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              adminText +
              "💬 Murojaat:\n" +
              message.text
            );
          }


          // ===================================================
          // RASM
          // ===================================================
          else if (message.photo) {

            // Avval ma'lumot yuboramiz
            await sendMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              adminText +
              "🖼️ Mijoz rasm yubordi.\n\n" +
              (caption
                ? "💬 Izoh:\n" + caption
                : "💬 Izoh: yozilmagan")
            );

            // Keyin rasmning o'zini yuboramiz
            await copyMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              chatId,
              message.message_id
            );
          }


          // ===================================================
          // VIDEO
          // ===================================================
          else if (message.video) {

            // Avval ma'lumot
            await sendMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              adminText +
              "🎥 Mijoz video yubordi.\n\n" +
              (caption
                ? "💬 Izoh:\n" + caption
                : "💬 Izoh: yozilmagan")
            );

            // Keyin videoning o'zi
            await copyMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              chatId,
              message.message_id
            );
          }


          // ===================================================
          // HUJJAT / BOSHQA MEDIA
          // ===================================================
          else if (message.document) {

            await sendMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              adminText +
              "📎 Mijoz fayl yubordi.\n\n" +
              (caption
                ? "💬 Izoh:\n" + caption
                : "💬 Izoh: yozilmagan")
            );

            await copyMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              chatId,
              message.message_id
            );
          }


          // ===================================================
          // VOICE
          // ===================================================
          else if (message.voice) {

            await sendMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              adminText +
              "🎤 Mijoz ovozli xabar yubordi."
            );

            await copyMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              chatId,
              message.message_id
            );
          }


          // ===================================================
          // BOSHQA XABAR
          // ===================================================
          else {

            await sendMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              adminText +
              "📨 Mijoz xabar yubordi."
            );

            await copyMessage(
              env.BOT_TOKEN,
              env.ADMIN_CHAT_ID,
              chatId,
              message.message_id
            );
          }


          // ===================================================
          // HOLATNI TOZALASH
          // ===================================================
          await env.STATE.delete(String(chatId));


          // ===================================================
          // MIJOZGA TASDIQ
          // ===================================================
          await sendMessage(
            env.BOT_TOKEN,
            chatId,
            "✅ Murojaatingiz qabul qilindi!\n\n" +
            "E'tiboringiz uchun rahmat. 🙏\n" +
            "Murojaatingiz mas'ullarga yetkazildi."
          );


          return new Response("OK");
        }
      }


      // =====================================================
      // TUGMA BOSILGANDA
      // =====================================================
      if (update.callback_query) {

        const callback = update.callback_query;

        const chatId = callback.message.chat.id;

        const data = callback.data;


        // ===================================================
        // SHIKOYAT / TAKLIF
        // ===================================================
        if (data === "complaint" || data === "suggestion") {

          // Holatni 30 daqiqaga saqlaymiz
          await env.STATE.put(
            String(chatId),
            data,
            {
              expirationTtl: 1800
            }
          );


          const text = data === "complaint"
            ? "📝 Shikoyatingizni yuboring."
            : "💡 Taklifingizni yuboring.";


          await sendMessage(
            env.BOT_TOKEN,
            chatId,
            text +
            "\n\n" +
            "Matn yozishingiz yoki 🖼️ rasm / 🎥 video yuborishingiz mumkin.\n\n" +
            "Bekor qilish uchun /start ni bosing."
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

      return new Response(
        "Error: " + error.message,
        {
          status: 500
        }
      );
    }
  }
};


// =========================================================
// TELEGRAMGA MATN YUBORISH
// =========================================================
async function sendMessage(
  token,
  chatId,
  text,
  keyboard = null
) {

  const body = {
    chat_id: chatId,
    text: text
  };


  if (keyboard) {
    body.reply_markup = keyboard;
  }


  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(body)
    }
  );


  return response;
}


// =========================================================
// RASM / VIDEO / MEDIA XABARNI GURUHGA KO'CHIRISH
// =========================================================
async function copyMessage(
  token,
  destinationChatId,
  sourceChatId,
  messageId
) {

  const response = await fetch(
    `https://api.telegram.org/bot${token}/copyMessage`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        chat_id: destinationChatId,
        from_chat_id: sourceChatId,
        message_id: messageId
      })
    }
  );


  return response;
}


// =========================================================
// TUGMA BOSILGANINI TELEGRAMGA BILDIRISH
// =========================================================
async function answerCallback(
  token,
  callbackId
) {

  const response = await fetch(
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


  return response;
      }
