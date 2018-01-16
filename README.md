# alexa-custom-skill-light
## Alexa custom skill
### Use AWS lambda

- config.example -> config
- npm install
- upload this project to lambda


# 알렉사 커스텀 스킬
### 람다를 통해 알렉사와 연동 가능

- config.example 폴더 -> config로 수정
- command에서 npm install로 모듈을 설치
- 이 프로젝트 폴더를 압축해서 AWS 람다에 zip 형태로 올리면 실행 가능
  - [AWS CLI](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-chap-welcome.html)를 활용하여 timeout에 걸리지 않고 zip파일을 올릴 수 있음
    - 활용 방법 [링크](https://asyoulook.com/computers%20&%20internet/amazon-web-services-aws-lambda-timeout-while-trying-to-upload-updated-node-zip-file/915947)

#### 알렉사 skill 구성하기

- 스킬 구성하기(Build An Alexa How To Skill) [링크](https://github.com/alexa/skill-sample-nodejs-howto/blob/master/instructions/0-intro.md)
- 스킬에 아마존 로그인 연동하기(Login with Amazon, LWA) [링크](https://developer.amazon.com/blogs/post/Tx3CX1ETRZZ2NPC/Alexa-Account-Linking-5-Steps-to-Seamlessly-Link-Your-Alexa-Skill-with-Login-wit)

- 아마존 개발자 홈(Amazon developer) [링크](https://developer.amazon.com/alexa-skills-kit)



-----------------------------------------------------------------

##### 참고
- 예제 코드 (Code) [링크](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
- AWS CLI 구성 방법 [링크](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-chap-getting-started.html)
