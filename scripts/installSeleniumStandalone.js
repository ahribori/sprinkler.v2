import selenium from 'selenium-standalone';
import seleniumStandaloneConfiguration from 'selenium-standalone/lib/default-config';

seleniumStandaloneConfiguration.logger = (message) => {
    console.log(message);
};

selenium.install(seleniumStandaloneConfiguration, () => {
});
