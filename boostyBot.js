const { Telegraf } = require("telegraf")
const bot = new Telegraf("6130533777:AAF9sdKPti0VYeP4Eg7MX5htZwt6cWPeRac")

const { postLink } = require("./post")
const { getVideoInfo, downloadPreview } = require("./download");

bot.start(ctx => ctx.reply("Пришли сюда ссылку, а я сделаю из нее пост"))

bot.on("text", async ctx => {
    // ctx = {message: {text: "https://boosty.to/ikakprosto/posts/923d067b-6085-4321-b117-1dacf154f649"}};
// (async function() {
    const res = await getVideoInfo(ctx.message.text)
    const { title, previewLink, okLink } = res
    const previewPath = await downloadPreview(previewLink)
    console.log("here");
    return await postLink(ctx, okLink, previewPath, title)
// })()  
})

bot.launch({dropPendingUpdates: true})