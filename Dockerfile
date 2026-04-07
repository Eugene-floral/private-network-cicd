FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]












#node js 18 버전이 설치된 alpine linux를 베이스 이미지로 사용한다(매우 가볍 linux)
# 컨테이너 안에서 작업할 디렉토리를 /app으로 설정하고 모든 명령어는 /app에서 실행하자.
# 내 로컬 package.json, package-lock.json을 컨테이너 /app 안으로 복사. * 은 이 두개다 를 의미.
# package.json 보고 필요한 패키지를 npm을 사용해서 전부 설치하고, node_modules 폴더를 생성할 것.
# 나머지 모든 파일(server.js,views,pblic등을 컨테이너 /app안으로 복사한다.
#컨테이너가 5000번 포트를 사용한다고 선언
#컨테이너 시작할 때 실행할 명령어 , node server.js 실행 => 웹서버 실행.
#궁금한거는 이 컨테이너는 docker engine에서 실행.
#여기에서 docker engine에서 docker build 하면 docker image가 내 이 프로젝트 폴더를 바탕으로 
#자동으로 생성이 된다. 그리고 /app 디렉토리는 해당 컨테이너에 등록이 되는 것이다. 
