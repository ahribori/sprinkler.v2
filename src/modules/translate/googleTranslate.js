import log from '@logger';

/**
 * 구글 번역
 * @param text 번역할 텍스트
 * @param translateTo 번역할 언어 코드
 * @param browser
 * @returns {Promise.<*>}
 */
const translate = async (text, translateTo, browser) => {
  if (!text || text === undefined || text === null || text === '') {
    log.info('[googleTranslate.translate] Invalid text');
    return null;
  }
  log.info(
    `[googleTranslate.translate] "${
      text.length > 100 ? text.substring(0, 100) + '...' : text
    }" Will be translate to ${translateTo}`,
  );
  await browser.url(`https://translate.google.co.kr/?hl=ko&sl=auto&tl=${translateTo}`);
  await browser.execute(text => {
    document.querySelector('#source').value = text;
  }, text);
  const submitButton = await browser.$('.go-button.jfk-button');
  await submitButton.waitForExist(10000);
  await submitButton.click();
  log.info('[googleTranslate.translate]In translation...');
  const translatedText = await browser.$('.tlid-translation.translation');
  await translatedText.waitForExist(10000);
  const result = await translatedText.getText();

  log.info(
    '%s %s',
    '[googleTranslate.translate]',

    `Translation result: ${result.length > 100 ? result.substring(0, 100) + '...' : result}`,
  );

  return result;
};

export const translateToKorean = async (text, browser) => {
  return await translate(text, 'ko', browser);
};

export const translateToEnglish = async (text, browser) => {
  return await translate(text, 'en', browser);
};

export const translateToJapanese = async (text, browser) => {
  return await translate(text, 'ja', browser);
};

export const translateToChinese = async (text, browser) => {
  return await translate(text, 'zh-CN', browser);
};
