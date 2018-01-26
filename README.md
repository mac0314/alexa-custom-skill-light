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
    - 기본 활용 방법
      - [링크](https://asyoulook.com/computers%20&%20internet/amazon-web-services-aws-lambda-timeout-while-trying-to-upload-updated-node-zip-file/915947)
    - 배치 파일 활용 방법
      - 프로젝트 내 lambda_upload.bat 파일로 업로드 가능
      - [AWS CLI](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-chap-welcome.html)와 [7zip](http://www.7-zip.org/)가 설치되어 있어야 함.
    - 쉘 스크립트 파일 활용 방법
      - 프로젝트 내 lambda_upload.sh 파일로 업로드 가능
      - 커맨드에서 아래의 명령어를 실행하여 해당 파일을 실행 가능하게 만든 후 실행
      ```
        sudo chmod +x lambda_upload.sh
      ```
- 로컬 환경 테스트
  - [lambda-local](https://github.com/ashiina/lambda-local)을 활용하여 테스트 가능
  - 아래와 같이 Alexa-SDK를 활용하여 DynamoDB에 상태를 저장한 경우 이 부분은 lambda-local 테스트가 제대로 동작하지 않음
  ```
    this.attributes[key] = value
  ```

#### 알렉사 skill 구성하기
- 람다에 Alexa skill interface를 연결하여야 함
- IAM을 활용하여 람다에 DynamoDB, CloudWatch에 변경 권한을 주어야 함

- 스킬 구성하기(Build An Alexa How To Skill) [링크](https://github.com/alexa/skill-sample-nodejs-howto/blob/master/instructions/0-intro.md)
- 스킬에 아마존 로그인 연동하기(Login with Amazon, LWA) [링크](https://developer.amazon.com/blogs/post/Tx3CX1ETRZZ2NPC/Alexa-Account-Linking-5-Steps-to-Seamlessly-Link-Your-Alexa-Skill-with-Login-wit)

- 아마존 개발자 홈(Amazon developer) [링크](https://developer.amazon.com/alexa-skills-kit)



-----------------------------------------------------------------

##### 참고
- 예제 코드 (Code) [링크](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
- AWS CLI 구성 방법 [링크](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-chap-getting-started.html)
