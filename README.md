# Sprinkler

Sprinkler는 웹 크롤링 & 자동화를 쉽게 할 수 있게 도와주는 라이브러리입니다.

일정한 시간 간격으로 실시간 검색어를 수집한다던지,
매일 어떤 사이트에 로그인해서 출석체크를해서 포인트를 얻는다던지 하는 작업을 쉽게 구현할 수 있습니다.

HTTP 클라이언트만으로는 불가능한 클라이언트 사이드 렌더링 SPA도 크롤링 할 수 있도록
Selenium standalone server를 내장하고 있습니다.

## 1. 준비물
- Java 8↑ (Selenium standalone server를 구동하는데 필요합니다.)
- Node.js 10.x
- Chrome or Firefox browser

## 2. 시작하기
### 의존성 설치
```
npm install
```

### 설정
프로젝트 루트 경로에있는 config.example.yaml 파일을 같은 경로에 복사해서 config.yaml 파일을 만듭니다.
이 파일에서 각종 설정을 할 수 있답니다.

*config.yaml*
```
# scripts
scripts:
  includePattern:
  excludePattern:

# core
core:
  maxSession: 1

# selenium
selenium:
  protocol: http
  host: 127.0.0.1
  port: 4444
  browser: chrome
  logLevel: info
  standalone: true
```
- scripts > includePattern: __scripts__ 폴더에 작성된 모듈중에 특정 모듈들만 로딩하고 싶다면 여기에 해당 파일명들을 정규식으로 표현하세요.
- scripts > excludePattern: 마찬가지로 __scripts__ 폴더에 작성된 모듈중에 제외하고 싶은 모듈들의 파일면 패턴입니다. includePattern으로 먼저 필터링 된 후에 excludePattern이 적용됩니다.
- core > maxSession: 병렬처리를 동시에 몇 개 까지 허용할지
- selenium > protocol: 셀레늄 서버의 프로토콜 (standalone 설정이 true일 경우엔 이 설정은 필요 없습니다.)
- selenium > host: 셀레늄 서버의 호스트 (standalone 설정이 true일 경우엔 이 설정은 필요 없습니다.)
- selenium > port: 셀레늄 서버의 포트 (standalone 설정이 true일 경우엔 이 설정은 필요 없습니다.)
- selenium > browser: chrome 또는 firefox를 사용가능 합니다. 설치되어있는 브라우저로 설정.
- selenium > standalone: 내장된 셀레늄 서버를 사용할지 말지. false로 설정할 경우 별로도 셀레늄 서버를 띄워야 합니다.

### 스크립트 작성
src > __script__ 경로에 예제로 example.js 파일을 하나 만들고 다음과 같이 작성합니다.

다음 예제는 https://www.google.co.kr/에 접속해서 제목을 가져오는 예제입니다.
```
import Transaction from '../core/Transaction';

class ExampleTransaction extends Transaction {
  async task(browser) {
    await browser.url('https://www.google.co.kr/');
    const title = await browser.getTitle();
    console.log('Title was: ' + title);
  }

  onStart() {
    console.log('ExampleTransaction start.');
  }

  onDone() {
    console.log('ExampleTransaction done.');
  }

  onError(e) {
    console.log(e);
  }
}

```
Transaction 클래스를 상속한 클래스에 async method인 task()를 구현하면 트랜잭션이 실행될 때
webdriverio browser 객체가 인자로 주입됩니다. api는 https://webdriver.io/docs/api.html에서 확인할 수 있습니다.
onStart, onDone, onError는 트랜잭션이 시작되고 끝나거나 에러가 발생했을 때 실행되는 hook 입니다.

### 실행
```
new ExampleTransaction().run();
```
객체를 만들어서 run() 메소드를 호출하면 트랜잭션이 task queue에 들어가서 즉시 실행이 됩니다. task queue는 config.yaml
에서 설정한 maxSession만큼 병렬로 처리됩니다. task queue에 작업이 쌓여있으면 순서가 올 때 까지 작업이 지연될 수 있습니다.

```
new ExampleTransaction().schedule('0 0 7 * * *');

or

new ExampleTransaction().batch('0 0 7 * * *');
```
위와 같이 schedule() 메소드나 batch 메소드를 호출하면 cron 문법으로 특정 시각마다 트랜잭션을 실행할 수 있습니다.
마찬가지로 해당 시각에 작업이 정확히 시작되는 것이 아닌, task queue에 작업이 예약되는 것을 의미합니다.
