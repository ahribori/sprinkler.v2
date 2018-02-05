import fs from 'fs';
import path from 'path';
import log from '@logger';

const makeTitle = (title) => {
    const hasPhoneme = (a) => {
        const r = (a.charCodeAt(0) - parseInt('0xac00',16)) % 28;
        const t = String.fromCharCode(r + parseInt('0x11A8') -1);
        return t !== 'ᆧ';
    };
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
    // TODO
};