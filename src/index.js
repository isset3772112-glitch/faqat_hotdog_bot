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

        const text = message.text || "";
        const caption = message.caption || "";

        const username = message.from?.username
          ? "@" + message.from.username
          : "Ko‘rsatilmagan";

        const name = [
          message.from?.first_name || "",
          message.from?.last_name || ""
        ].join(" ").trim() || "Ko‘rsatilmagan";

        // ===================================================
        // /START
        // ===================================================
        if (text === "/start") {

          await env.STATE.delete(String(chatId));

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

        // ===================================================
        // SALOMLASHISH
        // ===================================================
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
            "Sizning fikringiz biz uchun muhim.\n" +
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

        // ===================================================
        // SAQLANGAN HOLAT
        // ===================================================
        const savedState = await env.STATE.get(String(chatId));

        if (savedState) {

          let state;

          try {
            state = JSON.parse(savedState);
          } catch {
            state = null;
          }

          // =================================================
          // MUROJAAT
          // =================================================
          if (
            state &&
            state.type &&
            state.branch
          ) {

            const type =
              state.type === "complaint"
                ? "📝 SHIKOYAT"
                : "💡 TAKLIF";

            // =================================================
            // GURUH UCHUN MA'LUMOT
            // =================================================
            const adminText =
              "📩 YANGI MUROJAAT\n\n" +
              "Turi: " + type + "\n" +
              "🏢 Filial: " + state.branch + "\n" +
              "👤 Ism: " + name + "\n" +
              "🔗 Telegram: " + username + "\n" +
              "🆔 ID: " + chatId + "\n\n";

            // =================================================
            // MATN
            // =================================================
            if (message.text) {

              await sendMessage(
                env.BOT_TOKEN,
                env.ADMIN_CHAT_ID,
                adminText +
                "💬 Murojaat:\n" +
                message.text
              );
            }

            // =================================================
            // RASM
            // =================================================
            else if (message.photo) {

              await sendMessage(
                env.BOT_TOKEN,
                env.ADMIN_CHAT_ID,
                adminText +
                "🖼️ Mijoz rasm yubordi.\n\n" +
                (
                  caption
                    ? "💬 Izoh:\n" + caption
                    : "💬 Izoh: yozilmagan"
                )
              );

              await copyMessage(
                env.BOT_TOKEN,
                env.ADMIN_CHAT_ID,
                chatId,
                message.message_id
              );
            }

            // =================================================
            // VIDEO
            // =================================================
            else if (message.video) {

              await sendMessage(
                env.BOT_TOKEN,
                env.ADMIN_CHAT_ID,
                adminText +
                "🎥 Mijoz video yubordi.\n\n" +
                (
                  caption
                    ? "💬 Izoh:\n" + caption
                    : "💬 Izoh: yozilmagan"
                )
              );

              await copyMessage(
                env.BOT_TOKEN,
                env.ADMIN_CHAT_ID,
                chatId,
                message.message_id
              );
            }

            // =================================================
            // HUJJAT
            // =================================================
            else if (message.document) {

              await sendMessage(
                env.BOT_TOKEN,
                env.ADMIN_CHAT_ID,
                adminText +
                "📎 Mijoz fayl yubordi.\n\n" +
                (
                  caption
                    ? "💬 Izoh:\n" + caption
                    : "💬 Izoh: yozilmagan"
                )
              );

              await copyMessage(
                env.BOT_TOKEN,
                env.ADMIN_CHAT_ID,
                chatId,
                message.message_id
              );
            }

            // =================================================
            // VOICE
            // =================================================
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

            // =================================================
            // BOSHQA
            // =================================================
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

            // =================================================
            // STATE TOZALASH
            // =================================================
            await env.STATE.delete(String(chatId));

            // =================================================
            // MIJOZGA TASDIQ
            // =================================================
            await sendMessage(
              env.BOT_TOKEN,
              chatId,
              "✅ Murojaatingiz qabul qilindi!\n\n" +
              "🏢 Filial: " + state.branch + "\n\n" +
              "E'tiboringiz uchun rahmat. 🙏\n" +
              "Murojaatingiz mas'ullarga yetkazildi."
            );

            return new Response("OK");
          }
        }
      }

      // =====================================================
      // TUGMA
      // =====================================================
      if (update.callback_query) {

        const callback = update.callback_query;
        const chatId = callback.message.chat.id;
        const data = callback.data;

        // ===================================================
        // SHIKOYAT / TAKLIF
        // ===================================================
        if (
          data === "complaint" ||
          data === "suggestion"
        ) {

          await env.STATE.put(
            String(chatId),
            JSON.stringify({
              type: data
            }),
            {
              expirationTtl: 1800
            }
          );

          await sendMessage(
            env.BOT_TOKEN,
            chatId,
            data === "complaint"
              ? "📝 Shikoyat yubormoqchisiz.\n\n" +
                "Avval shikoyat tegishli bo‘lgan filialni tanlang:"
              : "💡 Taklif yubormoqchisiz.\n\n" +
                "Avval taklif tegishli bo‘lgan filialni tanlang:",
            {
              inline_keyboard: [
                [
                  {
                    text: "1️⃣ Yunusobod filiali",
                    callback_data: "branch_yunusobod"
                  }
                ],
                [
                  {
                    text: "2️⃣ Oybek filiali",
                    callback_data: "branch_oybek"
                  }
                ],
                [
                  {
                    text: "3️⃣ Bo‘z bozor filiali",
                    callback_data: "branch_boz_bozor"
                  }
                ]
              ]
            }
          );

          await answerCallback(
            env.BOT_TOKEN,
            callback.id
          );

          return new Response("OK");
        }

        // ===================================================
        // FILIAL 1
        // ===================================================
        if (data === "branch_yunusobod") {

          await saveBranch(
            env,
            chatId,
            "Yunusobod filiali"
          );

          await askForMessage(
            env.BOT_TOKEN,
            chatId
          );

          await answerCallback(
            env.BOT_TOKEN,
            callback.id
          );

          return new Response("OK");
        }

        // ===================================================
        // FILIAL 2
        // ===================================================
        if (data === "branch_oybek") {

          await saveBranch(
            env,
            chatId,
            "Oybek filiali"
          );

          await askForMessage(
            env.BOT_TOKEN,
            chatId
          );

          await answerCallback(
            env.BOT_TOKEN,
            callback.id
          );

          return new Response("OK");
        }

        // ===================================================
        // FILIAL 3
        // ===================================================
        if (data === "branch_boz_bozor") {

          await saveBranch(
            env,
            chatId,
            "Bo‘z bozor filiali"
          );

          await askForMessage(
            env.BOT_TOKEN,
            chatId
          );

          await answerCallback(
            env.BOT_TOKEN,
            callback.id
          );

          return new Response("OK");
        }

        return new Response("OK");
      }

      return new Response("OK");

    } catch (error) {

      console.error("BOT ERROR:", error);

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
// FILIALNI SAQLASH
// =========================================================
async function saveBranch(env, chatId, branch) {

  const oldState = await env.STATE.get(
    String(chatId)
  );

  let state;

  try {
    state = JSON.parse(oldState);
  } catch {
    state = {};
  }

  state.branch = branch;

  await env.STATE.put(
    String(chatId),
    JSON.stringify(state),
    {
      expirationTtl: 1800
    }
  );
}


// =========================================================
// MUROJAAT SO‘RASH
// =========================================================
async function askForMessage(
  token,
  chatId
) {

  await sendMessage(
    token,
    chatId,
    "✅ Filial tanlandi.\n\n" +
    "Endi murojaatingizni yuboring.\n\n" +
    "💬 Matn yozishingiz mumkin.\n" +
    "🖼️ Rasm yuborishingiz mumkin.\n" +
    "🎥 Video yuborishingiz mumkin.\n\n" +
    "Bekor qilish uchun /start ni bosing."
  );
}


// =========================================================
// TELEGRAMGA XABAR YUBORISH
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

  const result = await response.json();

  if (!result.ok) {
    console.error(
      "Telegram sendMessage ERROR:",
      JSON.stringify(result)
    );

    throw new Error(
      "Telegram sendMessage: " +
      (result.description || "Noma'lum xato")
    );
  }

  return result;
}


// =========================================================
// XABARNI GURUHGA KO‘CHIRISH
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

  const result = await response.json();

  if (!result.ok) {
    console.error(
      "Telegram copyMessage ERROR:",
      JSON.stringify(result)
    );

    throw new Error(
      "Telegram copyMessage: " +
      (result.description || "Noma'lum xato")
    );
  }

  return result;
}


// =========================================================
// CALLBACK
// =========================================================
async function answerCallback(
  token,
  callbackId
) {

  return await fetch(
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
