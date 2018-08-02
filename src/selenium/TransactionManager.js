import log from '@logger';
import EventEmitter from 'events';
import kill from 'fkill';

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
            await this.killZombie();

            const transaction = this.transactionQueue[0];

            try {
                this.status = STATUS.RUNNING;
                await transaction();
            } catch (e) {
                log.error(e);
                log.info('----- DONE WITH ERROR -----');
            }

            this.status = STATUS.WAITING;
            this.popTransaction();
            return this.executeTransaction();
        }
    };

    killZombie = async () => {
        try {
            const killList = [];
            const chromeRegex = new RegExp(/chromedriver/);
            const processes = await psList();
            processes.forEach(process => {
                chromeRegex.test(process.name) && killList.push(process.pid);
            });
            await kill(killList, {
                force: true,
            });
        } catch (e) {
            log.error(e);
        }
    }
}