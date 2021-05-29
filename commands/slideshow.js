const Discord = require('discord.js')

module.exports.run = (client, message, args) => {
    message.channel.send(`Send a link or file for the image you would like to embed! When you are finished, type "complete"`)
    let filter = newMsg => newMsg.author.id === message.author.id;
    let collector = message.channel.createMessageCollector(filter, { idle: 60000 });
    collector.on('collect', m => {
        if(m.content === 'complete') collector.stop('manual')
    })

    let images = []
    collector.on('end', (collected, reason) => {
        if(!reason === 'manual') return;
        collected.each(image => {
            let regex = /(https?:\/\/.*\.(?:png|jpg|gif|jpeg|webp))(\?.+)?/

            if(image.attachments.size > 0) {
                let link = image.attachments.first().url
                if(!link) return

                images.push(link)
            }
            else if(image.content) {
                let link = image.content.match(regex)?.[0]
                if(!link) return;

                images.push(link)
            }
        })
        handleImages(message, images)
    })
}

async function handleImages(message, images) {
    let embed = new Discord.MessageEmbed()
    
    let currImage = 0
    embed.setImage(images[currImage])
    embed.setFooter(`1 / ${images.length}`)

    let m = await message.channel.send({embed: embed})
    await m.react('👈')
    await m.react('👉')

    const filter = (reaction) => reaction.emoji.name === '👈' || reaction.emoji.name === '👉'
    let collector = m.createReactionCollector(filter, {idle: 60000, dispose: true})
    collector.on('collect', (reaction) => {
        handleReactions(reaction)
    })  
    collector.on('remove', (reaction) => {
        handleReactions(reaction)
    })

    async function handleReactions(reaction) {
        if(reaction.emoji.name === '👈') {
            await handleReaction(-1)
        }
        else if(reaction.emoji.name === '👉') {
            await handleReaction(1)
        }
    }

    async function handleReaction(direction) {
        currImage += direction
        let wrappedNum = mod(currImage, images.length)
        embed.setImage(images[wrappedNum])
        embed.setFooter(`${wrappedNum + 1} / ${images.length}`)
        await m.edit({embed: embed})
    }
}


function mod(a, b) {
    c = a % b
    return (c < 0) ? c + b : c
}

module.exports.help = {
    "name": "slideshow",
    "description": "does shit"
}