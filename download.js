const fs = require("fs")
const https = require("https");
const Stream = require('stream').Transform
const path = require("path");
const { getCookies } = require("./getCookies");

async function getVideoInfo(url) {
    var data = ""
    const cookiePath = path.join(__dirname, "boostyCookies.txt")
    if(!fs.existsSync(cookiePath)) await getCookies()
    var cookies
    try {cookies = fs.readFileSync(cookiePath, "utf-8")} catch(err) {await getCookies()}
    console.log(`Starting fatching ${url}\n`);
    return await new Promise((resolve, reject) => {
        https.get(url, {headers: {"Cookie": `auth=${cookies}`}}, (res) => {
            res.on("data", chunk => data += chunk)
            res.on("error", error => reject(error))
            res.on("end", async () => {
                var hasAccessIndex = data.indexOf("hasAccess") + 11
                var hasAccess = data.substring(hasAccessIndex, data.indexOf(`,`, hasAccessIndex))
                if(hasAccess != "true") {
                    console.log(`Generating new cookies\n`);
                    await getCookies()
                    return await getVideoInfo(url)
                }
                
                data = data.substring(data.indexOf(`"posts":{"data"`) + 8)
    
                var startToSearchIndex = data.indexOf(`Post_title`) + 10
                var title = data.substring(data.indexOf(">", startToSearchIndex) + 1, data.indexOf(`</h1>`, startToSearchIndex)).trim()
                
                var priviewStartIndex = data.indexOf(`"preview":"`) + 11
                var previewLink = data.substring(priviewStartIndex, data.indexOf(`"`, priviewStartIndex)).trim()
                
                var okLinkStartIndex = data.indexOf(`"vid":`) + 7
                var okLink = "http://ok.ru/videoembed/" + data.substring(okLinkStartIndex, data.indexOf(`"`, okLinkStartIndex)).trim()
                
                console.log(`Data taked successfully\nTtitle: ${title}\nPreview Link: ${previewLink}\nOk.ru Link: ${okLink}\n`);
                resolve({title, previewLink, okLink})
            })
        }).end()
    }) 
}

async function downloadPreview(previewLink) {
    const previewPath = path.join(__dirname, "preview.png");
    return await new Promise((resolve, reject) => {
            https.request(previewLink, function (response) {
                console.log(`Starting downloading ${previewLink}\n`);
                var data = new Stream();
                response.on("data", (chunk) => data.push(chunk))
                response.on("error", (err) => reject(err))
                response.on("end", () => {
                    fs.writeFileSync(previewPath, data.read())
                    console.log(`${previewLink} successfully downloaded in ${previewPath}\n`)
                    resolve(previewPath)
                })
            }).end()
    })
}

module.exports = { getVideoInfo, downloadPreview }