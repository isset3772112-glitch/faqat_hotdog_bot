import os
import threading
from flask import Flask
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

BOT_TOKEN = os.environ.get("BOT_TOKEN")
ADMIN_CHAT_ID = os.environ.get("ADMIN_CHAT_ID")
PORT = int(os.environ.get("PORT", "10000"))

web = Flask(__name__)

@web.get("/")
def home():
    return "FAQAT_HOTDOG_BOT is running", 200

def run_web():
    web.run(host="0.0.0.0", port=PORT, use_reloader=False)


categories = {
    "complaint": "😕 E’tiroz",
    "suggestion": "💡 Taklif",
    "praise": "⭐ Fikr / maqtov",
    "problem": "📸 Muammo haqida xabar",
}

user_state = {}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("😕 E’tiroz", callback_data="complaint")],
        [InlineKeyboardButton("💡 Taklif", callback_data="suggestion")],
        [InlineKeyboardButton("⭐ Fikr / maqtov", callback_data="praise")],
        [InlineKeyboardButton("📸 Muammo haqida xabar", callback_data="problem")],
    ]

    await update.message.reply_text(
        "👋 Assalomu alaykum!\n\n"
        "Sizning fikringiz biz uchun muhim.\n"
        "Murojaatingiz anonim tarzda qabul qilinadi.\n\n"
        "Quyidagilardan birini tanlang:",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def choose_category(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    user_state[query.from_user.id] = query.data

    await query.edit_message_text(
        f"{categories[query.data]} tanlandi.\n\n"
        "Endi xabaringizni yozing yoki rasm/video yuboring.\n\n"
        "🔒 Ismingiz, username'ingiz va telefon raqamingiz "
        "admin guruhiga yuborilmaydi."
    )


async def receive(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    category = user_state.get(user_id)

    if not category:
        await start(update, context)
        return

    if not ADMIN_CHAT_ID:
        await update.message.reply_text("⚠️ Bot hali admin guruhiga ulanmagan.")
        return

    admin_id = int(ADMIN_CHAT_ID)
    title = categories[category]

    if update.message.text:
        await context.bot.send_message(
            chat_id=admin_id,
            text=f"📩 YANGI MUROJAAT\n{title}\n\n{update.message.text}"
        )

    elif update.message.photo:
        await context.bot.send_message(
            chat_id=admin_id,
            text=f"📩 YANGI MUROJAAT\n{title}\n\n"
                 f"{update.message.caption or '📷 Rasm yuborildi.'}"
        )
        await context.bot.send_photo(
            chat_id=admin_id,
            photo=update.message.photo[-1].file_id
        )

    elif update.message.video:
        await context.bot.send_message(
            chat_id=admin_id,
            text=f"📩 YANGI MUROJAAT\n{title}\n\n"
                 f"{update.message.caption or '🎥 Video yuborildi.'}"
        )
        await context.bot.send_video(
            chat_id=admin_id,
            video=update.message.video.file_id
        )

    else:
        await update.message.reply_text(
            "Iltimos, matn, rasm yoki video yuboring."
        )
        return

    user_state.pop(user_id, None)

    await update.message.reply_text(
        "✅ Xabaringiz qabul qilindi. Rahmat!\n\n"
        "Yana murojaat qilmoqchi bo‘lsangiz /start ni bosing."
    )


def main():
    threading.Thread(target=run_web, daemon=True).start()

    bot = Application.builder().token(BOT_TOKEN).build()

    bot.add_handler(CommandHandler("start", start))
    bot.add_handler(CallbackQueryHandler(choose_category))
    bot.add_handler(
        MessageHandler(filters.ALL & ~filters.COMMAND, receive)
    )

    bot.run_polling()


if __name__ == "__main__":
    main()
