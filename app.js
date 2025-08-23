// ======================
// app.js
// ======================

const DISTORT_DELAY_MS = 5000; // 왜곡까지 대기시간
const MIN_EDIT_LEN = 10;       // 수정 버튼 활성 최소 글자

// ----- 페이지 데이터 (각 10문장, 왜곡 1개, 이미지 전/후) -----
const PAGES = [
  {
    imgBefore: "img/page1_before.png",
    imgAfter:  "img/page1_after.png",
    sentences: [
      "오늘 공론지는 지역 미술관의 개관 10주년 특별전을 소개합니다.",
      "전시는 현대 생활 속에서 예술이 수행하는 사회적 역할을 탐구합니다.",
      "큐레이터는 관람객 참여형 아카이브와 작가 인터뷰를 곳곳에 배치했습니다.",
      "관람 동선은 오래된 건축 요소와 새로운 장치를 교차 배치해 시간의 층위를 드러냅니다.",
      "청소년 패널이 기획에 참여해 공개 토론과 피드백 과정을 설계했습니다.",
      "이번 전시는 해설을 텍스트에서 소리와 촉각, 움직임으로 확장합니다.",
      "관람객은 작은 인쇄 스튜디오에서 감상을 엽서로 제작해 남길 수 있습니다.",
      "작품 대여와 보존 문제를 둘러싼 현실적 조건도 솔직하게 공개됩니다.",
      "마지막 날에는 아티스트 토크와 동네 기록가 라운드테이블이 열립니다.",
      "전시는 지역 커뮤니티의 대화 장을 넓히는 계기가 되길 기대합니다."
    ],
    distort: { index: 6, text: "전시 입장료가 15만원으로 책정되어 큰 논란이 발생했습니다." } // 7번째 왜곡
  },
  {
    imgBefore: "img/page2_before.png",
    imgAfter:  "img/page2_after.png",
    sentences: [
      "두 번째 페이지는 ‘거리의 문장’ 프로젝트를 다룹니다.",
      "참여자들은 매주 도시 곳곳의 표지판·전단·메모를 채집합니다.",
      "수집된 문장들은 의미망으로 엮여 온라인 지도와 신문에 동시 게재됩니다.",
      "팀은 비문과 은어가 공적 공간에서 어떻게 작동하는지 관찰합니다.",
      "다국어 표지판의 번역 품질이 이동 경험에 미치는 영향도 기록합니다.",
      "차별적 표현은 삭제보다 맥락 공개와 토론으로 대응합니다.",
      "결과물은 누구나 수정 제안을 남길 수 있는 공개 저장소로 운영됩니다.",
      "학교·도서관·주민센터에서 낭독회와 소규모 전시가 순회로 열립니다.",
      "다음 분기에는 시각장애인 접근성을 고려한 음성 버전이 제공됩니다.",
      "도시의 문장을 시민이 함께 다듬는 느린 편집 과정이 핵심입니다."
    ],
    distort: { index: 3, text: "프로젝트는 비판을 피하기 위해 모든 오류를 은폐했다고 밝혔습니다." } // 4번째 왜곡
  },
  {
    imgBefore: "img/page3_before.png",
    imgAfter:  "img/page3_after.png",
    sentences: [
      "세 번째 페이지는 기술과 문화유산의 만남을 다루는 특집입니다.",
      "장인과 디자이너가 함께 도구의 사용법을 기록하는 워크숍을 열었습니다.",
      "참여자는 손의 움직임을 추적해 동작 사전을 구축합니다.",
      "자료는 오픈 라이선스로 배포되어 수업과 연구에 재사용됩니다.",
      "연구팀은 재현의 정확성보다 학습자의 신체 경험을 중시합니다.",
      "긴 공정을 단축하기 위해 가상 환경 실습을 병행합니다.",
      "기술은 설명을 대신하기보다 이해의 발판이어야 한다는 입장입니다.",
      "마지막에는 각자 배운 동작을 짧은 퍼포먼스로 공유합니다.",
      "참여자 피드백은 다음 회차 설계에 직접 반영됩니다.",
      "배움은 전시장이 아니라 사람 사이에서 완성된다는 메시지를 전합니다."
    ],
    distort: { index: 8, text: "참여자 다수는 유료 전환으로 프로그램이 중단됐다고 증언했습니다." } // 9번째 왜곡
  },
  {
    imgBefore: "img/page4_before.png",
    imgAfter:  "img/page4_after.png",
    sentences: [
      "네 번째 페이지는 지역 기록 보존소의 디지털 전환 사례를 소개합니다.",
      "자원봉사자는 사진과 필름을 스캔하고 메타데이터를 표준화합니다.",
      "오탈자와 누락 정보는 커뮤니티 리뷰로 보완됩니다.",
      "이용자는 주제·장소·연도로 탐색하며 자신만의 컬렉션을 만들 수 있습니다.",
      "아카이브는 위조 방지를 위해 해시 기반 무결성 검증을 도입했습니다.",
      "저작권 협의가 끝난 자료부터 점진적으로 공개 범위를 넓힙니다.",
      "학교 수업을 위한 교육 팩도 함께 배포됩니다.",
      "기록은 박물관의 뒷방이 아니라 현재의 삶에 닿아야 한다는 원칙입니다.",
      "올해 하반기에는 구술 아카이빙 툴킷을 공개할 예정입니다.",
      "보존과 접근성의 균형을 실험하는 과정이 계속됩니다."
    ],
    distort: { index: 1, text: "디지털화 과정에서 원본 필름 다수가 분실되었다고 밝혔습니다." } // 2번째 왜곡
  },
  {
    imgBefore: "img/page5_before.png",
    imgAfter:  "img/page5_after.png",
    sentences: [
      "다섯 번째 페이지는 예술교육 커리큘럼 개편안을 다룹니다.",
      "학생은 분석·제작·발표를 넘나드는 순환형 수업을 경험합니다.",
      "작품 평가는 결과물보다 과정 기록에 더 높은 비중을 둡니다.",
      "지역 기관과의 파트너십으로 현장 실습을 확장합니다.",
      "온라인 공동 편집 도구를 활용해 피드백을 상시화합니다.",
      "장비 접근성이 낮은 학생을 위한 대여 프로그램이 운영됩니다.",
      "비판적 사고와 윤리 섹션이 필수로 포함됩니다.",
      "장애 접근성 체크리스트가 과제 지침에 추가됐습니다.",
      "학기 말 페어는 누구나 참여 가능한 오픈 포맷으로 진행됩니다.",
      "개편안은 학습자 주도성과 돌봄의 언어를 강조합니다."
    ],
    distort: { index: 4, text: "교과는 전면 대면 시험으로 회귀하며 과정 기록은 폐지됩니다." } // 5번째 왜곡
  }
];

// ----- 상태 관리 -----
let currentPage = 1;                        // 1-based
const pageStates = new Map();               // pageIndex -> [{text, status}]
const timers = new Map();                   // pageIndex -> timeoutId

// ----- 유틸 -----
const $pages = () => $("#flipbook .page");
const getPageCount = () => $pages().length;
const getPageRoot = (i) => $pages().eq(i - 1); // 1-based
const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}年 ${mm}月 ${dd}日`;
};

// ----- 렌더러 -----
function renderSentences(pageIndex) {
  const $root = getPageRoot(pageIndex);
  const $body = $root.find(".page-body");
  const state = pageStates.get(pageIndex) || [];
  $body.empty();

  state.forEach((s, idx) => {
    const span = document.createElement("span");
    span.className = "sentence" + (s.status === "distorted" ? " distorting" : "");
    span.textContent = s.text;
    // 왜곡된 문장만 편집 가능
    span.addEventListener("click", () => {
      if ((pageStates.get(pageIndex)[idx] || {}).status === "distorted") {
        enterEditMode(span, pageIndex, idx);
      }
    });
    $body[0].appendChild(span);
    $body[0].appendChild(document.createTextNode(" "));
  });
}

// 왜곡 예약/적용
function scheduleDistortion(pageIndex) {
  clearDistortion(pageIndex);
  const t = setTimeout(() => applyDistortion(pageIndex), DISTORT_DELAY_MS);
  timers.set(pageIndex, t);
}
function clearDistortion(pageIndex) {
  const t = timers.get(pageIndex);
  if (t) { clearTimeout(t); timers.delete(pageIndex); }
}
function applyDistortion(pageIndex) {
  if (pageIndex !== currentPage) return; // 페이지 넘어갔으면 무시
  const data = PAGES[pageIndex - 1];
  if (!data || !data.distort) return;

  const st = pageStates.get(pageIndex);
  const { index, text } = data.distort;
  if (!st[index] || st[index].status === "modified") return;

  st[index] = { text, status: "distorted" };
  renderSentences(pageIndex);

  // 버튼 노출 & 비활성
  const $root = getPageRoot(pageIndex);
  $root.find(".action-box").show();
  $root.find(".action-btn").prop("disabled", true);
}

// 인라인 수정
function enterEditMode(spanEl, pageIndex, sentIdx) {
  const $root = getPageRoot(pageIndex);
  const $btn = $root.find(".action-btn");

  spanEl.contentEditable = "true";
  spanEl.focus();

  const onInput = () => {
    const val = spanEl.textContent.trim();
    $btn.prop("disabled", val.length < MIN_EDIT_LEN);
  };
  spanEl.addEventListener("input", onInput);

  $btn.off("click").on("click", async () => {
    const newText = spanEl.textContent.trim();
    if (newText.length < MIN_EDIT_LEN) return;

    // 상태/UI 반영
    const st = pageStates.get(pageIndex);
    st[sentIdx] = { text: newText, status: "modified" };
    spanEl.classList.remove("distorting");
    spanEl.contentEditable = "false";
    $btn.prop("disabled", true);
    $root.find(".action-box").hide();

//     // 이미지 교체 (before -> after)
//     const data = PAGES[pageIndex - 1];
//     $root.find(".page-image img").attr("src", data.imgAfter);

//     // TODO: 실제 저장이 필요하면 여기서 fetch 호출
//     // await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({page: pageIndex, index: sentIdx, text: newText}) });
//   });

 // 이미지 교체 (before -> after) + 페이드인
  const data = PAGES[pageIndex - 1];
  const $img = $root.find(".page-image img");

  // 1) 먼저 서서히 사라지게
  $img.addClass("fading");

  setTimeout(() => {
    // 2) 이미지 src 바꾸고
    $img.attr("src", data.imgAfter);

    // 3) 다시 서서히 나타나게
    $img.removeClass("fading");

    
  }, 300); // 0.3초 뒤에 교체 (transition과 어울리게)
});
}

// 페이지 로드 (문장/이미지/날짜 초기화 + 왜곡 예약)
function loadPage(pageIndex) {
  currentPage = pageIndex;
  clearDistortion(pageIndex);

  const data = PAGES[pageIndex - 1];
  if (!data) return;

  // 날짜 채우기 (id 혹은 class 둘 다 대응)
  const date = todayStr();
  const $root = getPageRoot(pageIndex);
  const $dates = $root.find(".current-date, #current-date");
  $dates.text(date);

  // 이미지 초기화
  $root.find(".page-image img").attr("src", data.imgBefore);

  // 버튼 초기화
  $root.find(".action-box").hide();
  $root.find(".action-btn").prop("disabled", true);

  // 문장 상태 초기화
  pageStates.set(pageIndex, data.sentences.map(t => ({ text: t, status: "original" })));
  renderSentences(pageIndex);

  // 왜곡 예약
  scheduleDistortion(pageIndex);
}


document.addEventListener("DOMContentLoaded", () => {
  const have = getPageCount();
  const need = PAGES.length;

  if (have < need) {
    console.warn(`[app.js] #flipbook .page 개수(${have}) < 데이터 페이지 수(${need}). HTML에 .page를 더 추가하세요.`);
  }

  // 첫 페이지 로드
  loadPage(1);

  // 페이지 넘길 때마다 현재 페이지 로드 (turn.js가 이미 초기화돼 있다고 가정하고 함)
  if ($.fn && $.fn.turn) {
    $("#flipbook").bind("turned", function(_, page){
      // turn.js는 1-based page index
      if (page >= 1 && page <= need) loadPage(page);

      const audio = document.getElementById("pageSound");
      if (audio) {
        audio.currentTime = 0; // 첨부터 재생
        audio.play().catch(err => console.log("Audio play blocked:", err));
      }
    });
  }
});
