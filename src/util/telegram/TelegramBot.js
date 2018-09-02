import config from '@config';
import log from '@logger';
import { save, load } from '../store';

const Bot = require('node-telegram-bot-api');

const token = config.telegram.telegramBotToken || 'YOUR_TELEGRAM_BOT_TOKEN';
const channels = config.telegram.telegramChannels || [];
const telegramId = config.telegram.telegramId;

const channelTable = load('telegram_channels') || {};

let instance = null;

class TelegramBot {
    constructor() {
        if (!instance) {
            instance = this;
            this.initialized = false;
            this.chatList = [];
            this.bot = new Bot(token, { polling: false });
            // this.chatBot = new Bot(token, { polling: true });

            // this.chatBot.on('message', this.listenMessage);

            let stackCount = 0;
            const checkStackCount = () => {
                if (stackCount === 0) {
                    this.initialized = true;
                    save('telegram_channels', channelTable);
                }
            };

            channels.forEach(channel => {
                if (!/^-/.test(channel)) {
                    if (!channelTable[channel]) {
                        stackCount++;
                        this.bot.sendMessage(`@${channel}`, '채널 ID를 확인하기 위한 메시지')
                            .then((msg) => {
                                this.chatList.push(msg.chat.id);
                                channelTable[channel] = msg.chat.id;
                                stackCount--;
                                checkStackCount();
                            })
                            .catch((error) => {
                                stackCount--;
                                checkStackCount();
                                log.error(error.message);
                            });
                    } else {
                        this.chatList.push(channelTable[channel]);
                    }
                } else {
                    /^-\d{13}/.test(channel) && this.chatList.push(channel);
                }
            });
            checkStackCount()
        }
        return {
            sendMessage: instance.sendMessage,
            sendPhoto: instance.sendPhoto,
        }
    }

    resolveChannel = (channel) => {
        if (/^-/.test(channel)) {
            return channel;
        }
        if (/^@/.test(channel)) {
            return channelTable[channel.replace(/^@/, '')];
        }
        return channelTable[channel];
    };

    listenMessage = (message) => {
        const { id } = message.from;

        if (telegramId && Number(telegramId) === Number(id)) {
            // private channel
            const { text } = message;
            this.bot.sendMessage(id, '봇 사용 권한이 있는 아이디 입니다.');
        }
    };

    sendMessage = (channel, message) => {
        if (typeof message === 'string') {
            if (!this.initialized) {
                setTimeout(() => {
                    this.sendMessage(message);
                }, 1000);
            } else {
                this.bot.sendMessage(this.resolveChannel(channel), message)
                    .catch(error => {
                        log.error(error.message);
                    })
            }
        }
    };

    sendPhoto = (channel, photo) => {
        if (!this.initialized) {
            setTimeout(() => {
                this.sendPhoto(photo);
            }, 1000);
        } else {
            this.bot.sendPhoto(this.resolveChannel(channel), photo)
                .catch(error => {
                    log.error(error.message);
                })
        }
    }
}

export default new TelegramBot();
