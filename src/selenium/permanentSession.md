# permanentSession Example

import PermanentSession from '@selenium/permanentSession';

const ps = new PermanentSession();

ps.enqueueTransaction(async (browser) => {
    await browser.url('');
})