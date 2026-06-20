// Navigation category menu data

export interface GubSubMenu {
  title: { name: string; path: string };
  sub: { name: string; path: string }[];
}
export interface GubMenuType {
  title: { name: string; path: string };
  main: GubSubMenu[];
  grid: string;
}
export const GUB_MENU: GubMenuType[] = [
  {
    title: { name: "뷰티", path: "B" },
    main: [
      {
        title: { name: "스킨케어", path: "001" },
        sub: [
          { name: "스킨/토너", path: "001" },
          { name: "에센스/세럼/앰플", path: "002" },
          { name: "크림", path: "003" },
          { name: "미스트/오일", path: "004" },
          { name: "스킨케어세트", path: "005" },
        ],
      },
      {
        title: { name: "마스크팩", path: "002" },
        sub: [
          { name: "시트팩", path: "001" },
          { name: "패드", path: "002" },
          { name: "페이셜팩", path: "003" },
          { name: "코팩", path: "004" },
          { name: "패치", path: "005" },
        ],
      },
      {
        title: { name: "더모 코스메틱", path: "003" },
        sub: [
          { name: "스킨케어", path: "001" },
          { name: "바디케어", path: "002" },
          { name: "클렌징", path: "003" },
          { name: "선케어", path: "004" },
          { name: "마스크팩", path: "005" },
        ],
      },
      {
        title: { name: "향수/디퓨저", path: "004" },
        sub: [
          { name: "여성향수", path: "001" },
          { name: "남성향수", path: "002" },
          { name: "유니섹스향수", path: "003" },
          { name: "미니/고체향수", path: "004" },
          { name: "홈프래그런스", path: "005" },
        ],
      },
      {
        title: { name: "클렌징", path: "005" },
        sub: [
          { name: "클렌징폼/젤", path: "001" },
          { name: "오일/밤", path: "002" },
          { name: "워터/밀크", path: "003" },
          { name: "필링&스크럽", path: "004" },
          { name: "티슈/패드", path: "005" },
          { name: "립&아이리무버", path: "006" },
        ],
      },
      {
        title: { name: "맨즈케어", path: "006" },
        sub: [
          { name: "스킨케어", path: "001" },
          { name: "메이크업", path: "002" },
          { name: "쉐이빙", path: "003" },
          { name: "헤어케어", path: "004" },
          { name: "바디케어", path: "005" },
          { name: "프래그런스/라이프", path: "006" },
        ],
      },
      {
        title: { name: "헤어케어", path: "007" },
        sub: [
          { name: "샴푸/린스", path: "001" },
          { name: "트리트먼트/팩", path: "002" },
          { name: "헤어에센스", path: "003" },
          { name: "염색약/펌", path: "004" },
          { name: "헤어기기/브러시", path: "005" },
          { name: "스타일링", path: "006" },
        ],
      },
      {
        title: { name: "선케어", path: "008" },
        sub: [
          { name: "선크림", path: "001" },
          { name: "선스틱", path: "002" },
          { name: "선쿠션", path: "003" },
          { name: "선스프레이/선패치", path: "004" },
          { name: "태닝/애프터선", path: "005" },
        ],
      },
      {
        title: { name: "메이크업", path: "009" },
        sub: [
          { name: "립메이크업", path: "001" },
          { name: "베이스메이크업", path: "002" },
          { name: "아이메이크업", path: "003" },
        ],
      },
      {
        title: { name: "뷰티소품", path: "010" },
        sub: [
          { name: "메이크업소품", path: "001" },
          { name: "스킨케어소품", path: "002" },
          { name: "아이소품", path: "003" },
          { name: "헤어/바디소품", path: "004" },
          { name: "괄사/네일소품", path: "005" },
          { name: "뷰티디바이스", path: "006" },
          { name: "뷰티잡화", path: "007" },
        ],
      },
      {
        title: { name: "바디케어", path: "011" },
        sub: [
          { name: "로션/오일", path: "001" },
          { name: "샤워/입욕", path: "002" },
          { name: "립케어", path: "003" },
          { name: "핸드케어", path: "004" },
          { name: "바디미스트", path: "005" },
          { name: "제모/왁싱", path: "006" },
          { name: "데오드란트", path: "007" },
          { name: "선물세트", path: "008" },
          { name: "베이비", path: "009" },
        ],
      },
      {
        title: { name: "네일", path: "012" },
        sub: [
          { name: "일반네일", path: "001" },
          { name: "젤네일", path: "002" },
          { name: "네일팁/스티커", path: "003" },
          { name: "네일케어", path: "004" },
        ],
      },
    ],
    grid: "1/5",
  },
  {
    title: { name: "헬스", path: "H" },
    main: [
      {
        title: { name: "건강식품", path: "001" },
        sub: [
          { name: "비타민", path: "001" },
          { name: "유산균", path: "002" },
          { name: "영양제", path: "003" },
          { name: "슬리밍/이너뷰티", path: "004" },
          { name: "키즈", path: "005" },
        ],
      },
      {
        title: { name: "구강용품", path: "002" },
        sub: [
          { name: "칫솔", path: "001" },
          { name: "치약", path: "002" },
          { name: "애프터구강케어", path: "003" },
          { name: "휴대용세트", path: "004" },
          { name: "구강가전", path: "005" },
        ],
      },
      {
        title: { name: "헬스/건강용품", path: "003" },
        sub: [
          { name: "패치/겔", path: "001" },
          { name: "눈관리용품", path: "002" },
          { name: "생활/의료", path: "003" },
          { name: "마사지/헬스용품", path: "004" },
          { name: "풋케어", path: "005" },
        ],
      },
      {
        title: { name: "여성/위생용품", path: "004" },
        sub: [
          { name: "생리/위생용품", path: "001" },
          { name: "Y존케어", path: "002" },
          { name: "성인용품", path: "003" },
          { name: "마사지젤/오일", path: "004" },
          { name: "테스트기", path: "005" },
          { name: "성인용 기저귀", path: "006" },
        ],
      },
    ],
    grid: "5/6",
  },
  {
    title: { name: "푸드", path: "F" },
    main: [
      {
        title: { name: "푸드", path: "001" },
        sub: [
          { name: "식단관리/이너뷰티", path: "001" },
          { name: "과자/초콜릿/디저트", path: "002" },
          { name: "생수/음료/커피", path: "003" },
          { name: "간편식/요리", path: "004" },
          { name: "베이비푸드", path: "005" },
        ],
      },
    ],
    grid: "6/7",
  },
  {
    title: { name: "라이프", path: "L" },
    main: [
      {
        title: { name: "패션", path: "001" },
        sub: [
          { name: "언더웨어", path: "001" },
          { name: "홈웨어", path: "002" },
          { name: "액티브웨어", path: "003" },
          { name: "패션잡화", path: "004" },
        ],
      },
      {
        title: { name: "리빙/가전", path: "002" },
        sub: [
          { name: "방향/탈취", path: "001" },
          { name: "세제/청소", path: "002" },
          { name: "홈데코/배스", path: "003" },
          { name: "가전", path: "004" },
          { name: "베이비", path: "005" },
          { name: "제지류", path: "006" },
          { name: "반려동물", path: "007" },
        ],
      },
      {
        title: { name: "취미/팬시", path: "003" },
        sub: [
          { name: "디지털/기기", path: "001" },
          { name: "문구/팬시", path: "002" },
          { name: "음반", path: "003" },
        ],
      },
    ],
    grid: "7/8",
  },
];
