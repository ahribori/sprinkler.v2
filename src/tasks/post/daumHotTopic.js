import fs from 'fs';
import path from 'path';
import log from '@logger';

/**
 * 키워드를 인자로 받아 제목을 만들어 주는 메소드
 * 키워드 마지막 글자의 받침문자 유무를 검사해 그에 맞는 이/가를 붙혀준다
 * @param keyword
 * @returns {string}
 */
const makeTitle = (keyword) => {
    const hasPhoneme = (a) => {
        const r = (a.charCodeAt(0) - parseInt('0xac00', 16)) % 28;
        const t = String.fromCharCode(r + parseInt('0x11A8') - 1);
        return t !== 'ᆧ';
    };
    const lastCharacter = keyword[keyword.length - 1];
    let mainKeyword;
    if (hasPhoneme(lastCharacter)) {
        mainKeyword = `${keyword}이`;
    } else {
        mainKeyword = `${keyword}가`;
    }

    const titleTemplates = [
        '{{keyword}} 왜 실시간 검색어에 떴을까요?',
        '{{keyword}} 핫한 이유?',
        `${keyword} 왜 떴을까?`,
        `헐 ${keyword} 실검 떴네요`,
        `${keyword} 실화냐ㅋㅋ`,
        `${keyword} 실검 장악!`,
    ];

    const randomIndex = Math.round(Math.random() * (titleTemplates.length - 1));

    return titleTemplates[randomIndex].replace('{{keyword}}', mainKeyword);
};

/**
 * 검색어, 관련검색어, 인물 프로필, 뉴스 오브젝트를 인자로 받아
 * 포스팅할 html 문서를 생성
 * @param keyword {string}
 * @param relatedKeywords {array}
 * @param profile {html}
 * @param news {array}
 */
export const buildPost = (keyword, relatedKeywords, profile, news) => {
    const templatePath = path.resolve('src/tasks/post/templates');
    let template = fs.readFileSync(path.join(templatePath, 'daum-hot-topic.html'), 'utf-8');
    let relatedKeywordsHTML = '';
    let newsCardListHTML = '';
    template = template.replace('{{title}}', makeTitle(keyword));
    template = template.replace('{{contents}}', '컨텐츠에용...');
    if (profile) {
        template = template
            .replace('{{thumbnailImage}}', profile.thumbnailImage)
            .replace('{{infoTitle}}', profile.infoTitle)
            .replace('{{infoDetails}}', profile.infoDetails)
    } else {
        template = template
            .replace('{{thumbnailImage}}', '')
            .replace('{{infoTitle}}', '')
            .replace('{{infoDetails}}', '')
    }
    relatedKeywords.forEach(relatedKeyword => {
        relatedKeywordsHTML +=
            `<a class="relatedKeyword" href="http://search.daum.net/search?w=tot&q=${relatedKeyword}" target="_blank">#${relatedKeyword}</a>`;
    });
    news.forEach(news => {
        newsCardListHTML +=
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
        .replace('{{relatedKeywords}}', relatedKeywordsHTML)
        .replace('{{news}}', newsCardListHTML);
    return template;
};