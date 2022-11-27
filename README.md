# 버스하냥 iOS 위젯

Scriptable widget을 이용한 버스하냥 위젯입니다.

원하는 정류장의 정보를 1x1, 1x4 사이즈의 위젯으로 추가하실 수 있습니다.

## 스크린샷



## 설치방법

1. App Store에서 Scriptable 앱을 설치합니다. [(링크)](https://apps.apple.com/kr/app/scriptable/id1405459188)
2. https://github.com/BusHanyang/hybus-ios-widget 에 접속하여, `hybus.js` 의 내용을 복사합니다. [(바로가기 링크)](https://raw.githubusercontent.com/BusHanyang/hybus-ios-widget/main/hybus.js) <- 이게 더 편합니다
3. Scriptable App을 열어, 상단에 있는 추가 버튼을 누르고, 새 창이 뜨면 복사한 내용을 붙여넣기 합니다.
4. 완료 버튼을 누르고, 해당 스크립트의 식별할 수 있게 이름을 변경합니다.
5. 위젯을 설치하고자 하는 홈 화면으로 이동합니다.
6. 홈 화면 편집 모드에 들어가서, 위젯 추가하기를 선택한 후, Scriptable을 선택합니다.
7. 원하는 위젯 크기를 선택하고, 홈화면에 추가합니다. (1x1, 1x4 만 지원)
8. 홈 화면 편집 모드에서 나온 후, 위젯을 길게 눌러 위젯 편집을 선택합니다.
9. 위젯 편집 창에서 스크립트 선택란에는 아까 식별할 수 있게 이름을 변경한 스크립트를 선택합니다.
10. 파라미터에 원하는 정류장 이름 하나를 한글로 기입합니다. 목록: `셔틀콕`, `한대앞`, `예술인`, `기숙사`, `중앙역`, `건너편` 중 택 1
11. 위젯 편집이 완료되면, 버스 시간이 정상적으로 출력되는지 확인합니다.


## 스크립트 업데이트 하기

매번 위와 같은 방법을 반복하는건 매우 귀찮기 때문에 해당 스크립트에는 업데이트 기능이 내장되어 있습니다. 혹시나 작동이 안되거나 오류가 날 시 해당 방법을 이용해 보세요.

1. Scriptable App을 실행합니다.
2. 버스하냥 스크립트를 클릭하여 실행하면, 프롬프트가 나옵니다.
3. 프롬프트에서 "최신 버전으로 업데이트하기"를 선택합니다.
4. 성공적으로 스크립트를 업데이트하였으면, 다시 위젯이 작동하는지 확인합니다. 상태가 바뀌지 않았다면, 휴대폰을 재부팅 해주세요.


## 유의사항

* 위젯의 자동 업데이트 주기는 애플에서 수동으로 조절하지 못하게 막아놓았습니다. 위젯이 있는 화면이 사용자에게 얼마나 노출되냐에 따라 업데이트 빈도가 바뀌게 됩니다.
* 실시간 정보가 필요하시면 위젯을 클릭하여 버스하냥 웹으로 접속해 시간표를 확인해 주세요.
* 문의사항은 admin@hybus.app 으로 연락주시면 감사하겠습니다.