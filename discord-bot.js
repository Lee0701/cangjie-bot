
const fs = require('fs')
const Discord = require('discord.js')

class DiscordBot {
    constructor(token, prefix) {
        this.token = token || process.env.BOT_TOKEN
        this.prefix = prefix || process.env.BOT_CMD_PREFIX || '!'

        this.client = new Discord.Client()
        this.client.commands = new Discord.Collection()

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`)
        })

        fs.readdirSync('./commands').filter(file => file.endsWith('.js')).forEach(file => {
            const command = require('./commands/' + file)
            this.client.commands.set(command.name, command)
            if(command.aliases) command.aliases.forEach(alias => this.client.commands.set(alias, command))
        })

        this.client.on('message', (msg) => {
            if(!msg.content.startsWith(this.prefix) || msg.author.bot) return

            const args = msg.content.slice(this.prefix.length).split(/ +/)
            const cmd = args.shift().toLowerCase()

            const command = this.client.commands.get(cmd)
            if(command) command.execute(msg, args)

        })

    }
    login() {
        this.client.login(this.token)
    }
    destroy() {
        this.client.destroy()
    }
}

module.exports = DiscordBot
