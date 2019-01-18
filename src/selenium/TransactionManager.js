import log from '@logger';
import conf from '@config';
import bot from '@bot';
import EventEmitter from 'events';
import fkill from 'fkill';

const psList = require('ps-list');

const EVENT_TYPE = {
    PUSH: 'PUSH',
    POP: 'POP',
};

const STATUS = {
    WAITING: 'WAITING',
    RUNNING: 'RUNNING',
};

let instance = null;

export default class TransactionManager {
    constructor() {
        if (!instance) {
            this.transactionQueue = [];
            this.status = STATUS.WAITING;
            this.event = new EventEmitter();
            this.bindEventListener();
            instance = {
                pushTransaction: this.pushTransaction,
            };
        }
        return instance;
    }

    bindEventListener = () => {
        this.event.on(EVENT_TYPE.PUSH, this.onPush);
        this.event.on(EVENT_TYPE.POP, this.onPop);
    };

    pushTransaction = (transaction) => {
        this.transactionQueue.push(transaction);
        this.event.emit(EVENT_TYPE.PUSH);
    };

    popTransaction = () => {
        this.transactionQueue.shift();
        this.event.emit(EVENT_TYPE.POP);
    };

    onPush = () => {
        log.info(`PUSH [Queue length:${this.transactionQueue.length}]`);
        return this.executeTransaction();
    };

    onPop = () => {
        log.info(`POP [Queue length:${this.transactionQueue.length}]`);
    };

    executeTransaction = async () => {
        if (this.status !== STATUS.RUNNING) {
            if (this.transactionQueue.length === 0) {
                return;
            }

            const transaction = this.transactionQueue[0];

            try {
                this.status = STATUS.RUNNING;
                await transaction();
            } catch (e) {
                log.error(e);
                bot.sendMessage('@sprinkler_error', e);
                log.info('----- DONE WITH ERROR -----');
            }

            await this.killZombie();

            this.status = STATUS.WAITING;
            this.popTransaction();
            return this.executeTransaction();
        }
    };

    killZombie = async () => {
        const { kill } = conf;
        try {
            if (!kill) {
                return;
            }
            const killList = [];
            const killRegex = new RegExp(kill, 'gi');
            const processes = await psList();
            for (let i = 0; i < processes.length; i++) {
                const process = processes[i];
                killRegex.test(process.name) && killList.push(process.pid);
            }
            await fkill(killList, {
                force: true,
            });
        } catch (e) {
        }
    }
}
