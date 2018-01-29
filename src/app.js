import seleniumStandalone from '@selenium/seleniumStandalone';
import PermanentSession from '@selenium/permanentSession';
import '@schedules';

seleniumStandalone.start(() => {
    new PermanentSession();
});
