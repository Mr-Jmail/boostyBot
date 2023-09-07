const fs = require("fs")
const {TelegramClient, Api} = require("telegram");
const { StringSession } = require("telegram/sessions");
const client = new TelegramClient(new StringSession("1AgAOMTQ5LjE1NC4xNjcuNDEBu5vdZGjzjk7JRqQXST2cHhpqjaneDJChu3R76Quvaz6tAEUO73vEQY4xhJ2hZ1vOhsvxA5EUgKynyiaMoEZ/MuSPM/+wSOLUSG3oYI9rm9op8uAUlUhXey6Vr3LNzihLdpaEK6x+SIcXEoGAVA9g1qithMqddQdCN0izYD/QLHy0ZYIKJ+DcbyFs7FFPPJviH5zgXpPAtyXHIOrmiKzeD3v77vO02pUV4zD03+AByiT3UVOuQok8ZihMDwB7NYAPSFnNV3SkZl0bvNaNTbOetY8tK06aA1KLEdUZDzfkWQf6yyO8xv1FHUuO2PpvUIrr4wz9TvrGDXtsv+Pdv4Z4RA4="), 16073924, "16b2123055b4c7e80c80888a36da461f");
const testChannel = "sdfdfsafsddf"

async function postLink(ctx, link, previewPath, title) {
    console.log("Posting link\n")
    if(!fs.existsSync(previewPath) && !previewPath.includes("http")) return `Error: preview path ${previewPath} is incorret`
    console.log("The preview is ok\n")
    await client.connect()
    const caption = `<b>${title}</b>\n${link}\nГайд для пк - <a href="https://docs.google.com/document/d/1irm1EeaKFEm23vtcVn6G4SOtcm1SyQm2cMsUW4AhSgs/edit?usp=sharing">клик сюды</a>\nГайд для телефонов - <a href="https://docs.google.com/document/d/1IPEH8p-lYaxi0t0RSEt5UpotBBYwhtSITXle0KSGDnE/edit?usp=sharing">клик сюды</a>`
    // const message = await ctx.repl(testChannel, {file: previewPath, forceDocument: false, caption, parseMode: "html"})
    await ctx.replyWithPhoto({source: previewPath}, {caption, parse_mode: "HTML"})
    // console.log(`Link is posted successfully with message_id ${message.id}`)
    await client.disconnect()
    // return message.id
}

async function postVideo(videoPath, previewPath, title) {
    if(!fs.existsSync(videoPath)) return `Error: video path ${videoPath} is incorret`
    if(!fs.existsSync(previewPath)) return `Error: preview path ${previewPath} is incorret`
    const {w, h, duration} = await getMetadata(videoPath)
    await client.connect()
    try {await client.sendFile(testChannel, {file: videoPath, caption: `<b>${title}</b>`, attributes: [new Api.DocumentAttributeVideo({w, h, supportsStreaming: true, duration})], workers: 10, thumb: previewPath, parseMode: "html"})} 
    catch (error) {return error}
    await client.disconnect()
    fs.rmSync(previewPath, {force: true})
    fs.rmSync(videoPath, {force: true})
    return "ok"
}

async function getMetadata(videoPath) {
    return await new Promise((res, rej) => {
        ffmpeg.ffprobe(videoPath, function(err, metadata) {
            if(err) rej(err)
            else res({w: metadata.streams[0].width, h: metadata.streams[0].height, duration: metadata.streams[0].duration})
        })
    })
}

module.exports = { postLink, postVideo }