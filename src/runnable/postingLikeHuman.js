require('dotenv').config();
import log from '@logger';
import cron from '@cron';
import PermanentSession from '@selenium/permanentSession';
const ps = new PermanentSession();
import {
    getHotTopicList,
    searchByKeyword,
} from '../tasks/crawling/daumHotTopic';

const buildPost = (KEYWORD) => {
    ps.enqueueTransaction(async (browser) => {
        const result = await searchByKeyword(KEYWORD, browser);
        const templatePath = path.resolve('src/tasks/post/templates');
        let template = fs.readFileSync(path.join(templatePath, 'daum-hot-topic.html'), 'utf-8');
        let relatedKeywords = '';
        let newsCardList = '';
        if (result.profile) {
            template = template
                .replace('{{thumbnailImage}}', result.profile.thumbnailImage)
                .replace('{{infoTitle}}', result.profile.infoTitle)
                .replace('{{infoDetails}}', result.profile.infoDetails)
        } else {
            template = template
                .replace('{{thumbnailImage}}', '')
        }
        result.relatedKeywords.forEach(keyword => {
            relatedKeywords +=
                `<a class="relatedKeyword" href="http://search.daum.net/search?w=tot&q=${keyword}" target="_blank">${keyword}</a>`;
        });
        result.news.forEach(news => {
            newsCardList +=
                `<a class="newsCard" href="${news.link}" target="_blank">
    <div class="newsCard_header">
        <img src="${news.thumbnail_image}" alt="${news.title}">
    </div>
    <div class="newsCard_footer">
        <div class="newsCard_title">${news.title}</div>
        <div class="newsCard_description">${news.description}...</div>
    </div>    
</a>`;
        });
        template = template
            .replace('{{relatedKeywords}}', relatedKeywords)
            .replace('{{news}}', newsCardList);
        fs.writeFileSync(path.join(templatePath, `${Date.now()}_${KEYWORD}.html`), template, 'utf-8');
    });
};

const job = new cron('0 0 7,8,9,12,13,14,19,21,22,23 * * *', () => {
    const minutesTimeoutRange = 20;
    const secondTimeoutRange = 60;
    const randomTimeoutMinutes = Math.round(Math.random() * (minutesTimeoutRange - 1)); // 0 ~29
    const randomTimeoutSecond = Math.round(Math.random() * (secondTimeoutRange - 1)); // 0 ~ 59
    const timeout = ((randomTimeoutMinutes * 60) + (randomTimeoutSecond)) * 1000;
    log.info(`${randomTimeoutMinutes}분 ${randomTimeoutSecond}초 후에 실행.`);
    setTimeout(() => {
        log.info(`실행.`);
    }, timeout);
});
job.start();
