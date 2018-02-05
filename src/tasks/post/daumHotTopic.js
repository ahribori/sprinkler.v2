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
        const r = (a.charCodeAt(0) - parseInt('0xac00',16)) % 28;
        const t = String.fromCharCode(r + parseInt('0x11A8') -1);
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
        '지금 {{keyword}} 핫한 이유?',
        '"{{keyword}} 왜 떴을까?"',
        `헐 지금 ${keyword} 실시간 검색어 떴네요`
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
    const TITLE = makeTitle(keyword);
    const TAGS = relatedKeywords;
    const PROFILE = profile;
    const NEWS = news;
    console.log(TITLE);
    console.log(TAGS);
    console.log(PROFILE);
    console.log(NEWS);
};