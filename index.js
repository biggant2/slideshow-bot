const Discord = require('discord.js')
const fs = require('fs')

const client = new Discord.Client()
client.commands = new Discord.Collection()

const { token, prefix } = require('./config.json')

fs.readdir("./commands/", (_, files) => {
    let jsFiles = files.filter(f => f.split(".").pop() === "js")

    jsFiles.forEach((f) =>{
        let props = require(`./commands/${f}`);
        console.log(`${f} loaded!`);
        client.commands.set(props.help.name, props);
    });
});
  

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on('message', (message) => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;

    let args = message.content.slice(prefix.length).split(' ');
    let commandName = args.shift().toLowerCase();
    
    let command = client.commands.get(commandName);
    if(command) command.run(client, message, args);
})

client.login(token)