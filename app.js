// ======================
// app.js
// ======================

const DISTORT_DELAY_MS = 3000; // 왜곡까지 대기시간
const MIN_EDIT_LEN = 10;       // 수정 버튼 활성 최소 글자
const COVER_OFFSET = 1; // 1페이지는 커버


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
  // {
  //   imgBefore: "img/page2_before.png",
  //   imgAfter:  "img/page2_after.png",
  //   sentences: [
  //     "두 번째 페이지는 ‘거리의 문장’ 프로젝트를 다룹니다.",
  //     "참여자들은 매주 도시 곳곳의 표지판·전단·메모를 채집합니다.",
  //     "수집된 문장들은 의미망으로 엮여 온라인 지도와 신문에 동시 게재됩니다.",
  //     "팀은 비문과 은어가 공적 공간에서 어떻게 작동하는지 관찰합니다.",
  //     "다국어 표지판의 번역 품질이 이동 경험에 미치는 영향도 기록합니다.",
  //     "차별적 표현은 삭제보다 맥락 공개와 토론으로 대응합니다.",
  //     "결과물은 누구나 수정 제안을 남길 수 있는 공개 저장소로 운영됩니다.",
  //     "학교·도서관·주민센터에서 낭독회와 소규모 전시가 순회로 열립니다.",
  //     "다음 분기에는 시각장애인 접근성을 고려한 음성 버전이 제공됩니다.",
  //     "도시의 문장을 시민이 함께 다듬는 느린 편집 과정이 핵심입니다."
  //   ],
  //   distort: { index: 3, text: "프로젝트는 비판을 피하기 위해 모든 오류를 은폐했다고 밝혔습니다." } // 4번째 왜곡
  // },
  // {
  //   imgBefore: "img/page3_before.png",
  //   imgAfter:  "img/page3_after.png",
  //   sentences: [
  //     "세 번째 페이지는 기술과 문화유산의 만남을 다루는 특집입니다.",
  //     "장인과 디자이너가 함께 도구의 사용법을 기록하는 워크숍을 열었습니다.",
  //     "참여자는 손의 움직임을 추적해 동작 사전을 구축합니다.",
  //     "자료는 오픈 라이선스로 배포되어 수업과 연구에 재사용됩니다.",
  //     "연구팀은 재현의 정확성보다 학습자의 신체 경험을 중시합니다.",
  //     "긴 공정을 단축하기 위해 가상 환경 실습을 병행합니다.",
  //     "기술은 설명을 대신하기보다 이해의 발판이어야 한다는 입장입니다.",
  //     "마지막에는 각자 배운 동작을 짧은 퍼포먼스로 공유합니다.",
  //     "참여자 피드백은 다음 회차 설계에 직접 반영됩니다.",
  //     "배움은 전시장이 아니라 사람 사이에서 완성된다는 메시지를 전합니다."
  //   ],
  //   distort: { index: 8, text: "참여자 다수는 유료 전환으로 프로그램이 중단됐다고 증언했습니다." } // 9번째 왜곡
  // }
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
// function renderSentences(pageIndex) {
//   const $root = getPageRoot(pageIndex);
//   const $body = $root.find(".page-body");
//   const state = pageStates.get(pageIndex) || [];
//   $body.empty();

//   state.forEach((s, idx) => {
//     const span = document.createElement("span");
//     span.className = "sentence" + (s.status === "distorted" ? " distorting" : "");
//     span.textContent = s.text;
//     // 왜곡된 문장만 편집 가능
//     span.addEventListener("click", () => {
//       if ((pageStates.get(pageIndex)[idx] || {}).status === "distorted") {
//         enterEditMode(span, pageIndex, idx);
//       }
//     });
//     $body[0].appendChild(span);
//     $body[0].appendChild(document.createTextNode(" "));
//   });
// }

// app.js 상단 어딘가
function preloadImages() {
  PAGES.forEach(p => {
    ['imgBefore','imgAfter'].forEach(k => {
      const img = new Image();
      img.src = p[k];
    });
  });
}


// function initAllPages() {
//   const need = PAGES.length;

//   for (let i = 1; i <= need; i++) {
//     const data = PAGES[i - 1];
//     const $root = getPageRoot(i);

//     // 날짜
//     const date = todayStr();
//     $root.find(".current-date, #current-date").text(date);

//     // 이미지(before) 고정
//     $root.find(".page-image img").attr("src", data.imgBefore);

//     // 상태/문장 렌더
//     pageStates.set(i, data.sentences.map(t => ({ text: t, status: "original" })));
//     renderSentences(i);
//   }
// }

function initAllPages() {
  const need = PAGES.length;

  for (let i = 0; i < need; i++) {
    const data = PAGES[i];
    const pageIndex = i + 2; // ⚡ 데이터는 2번째 page부터 채운다 (1번은 인트로)

    const $root = getPageRoot(pageIndex);

    // 날짜
    const date = todayStr();
    $root.find(".current-date, #current-date").text(date);

    // 이미지(before) 고정
    $root.find(".page-image img").attr("src", data.imgBefore);

    // 상태/문장 렌더
    pageStates.set(pageIndex, data.sentences.map(t => ({ text: t, status: "original" })));
    renderSentences(pageIndex);
  }
}



function renderSentences(pageIndex) {
  const $root = getPageRoot(pageIndex);
  const $body = $root.find(".page-body");
  const state = pageStates.get(pageIndex) || [];
  $body.empty();

  state.forEach((s, idx) => {
    // 문장 노드
    const span = document.createElement("span");
    span.className = "sentence" + (s.status === "distorted" ? " distorting" : "");
    span.textContent = s.text;

    // 왜곡 문장은 클릭으로도 편집 진입 허용
    span.addEventListener("click", () => {
      if ((pageStates.get(pageIndex)[idx] || {}).status === "distorted") {
        // 옆에 만들어질 버튼 참조가 없을 수 있으므로, 이미 있으면 가져오고 없으면 null
        const maybeBtn = span.nextSibling && span.nextSibling.classList && span.nextSibling.classList.contains('action-btn-inline')
          ? span.nextSibling
          : null;
        enterEditMode(span, pageIndex, idx, maybeBtn);
      }
    });

    $body[0].appendChild(span);

    // 왜곡 문장 옆에 아이콘 버튼 추가
    if (s.status === "distorted") {
      const btn = document.createElement("button");
      btn.className = "action-btn-inline";
      btn.type = "button";
      btn.setAttribute("aria-label", "문장 수정");
      btn.innerHTML = '<i class="fas fa-pen"></i>'; // 연필 아이콘
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // 문장 클릭 이벤트와 충돌 방지
        enterEditMode(span, pageIndex, idx, btn);
      });
      $body[0].appendChild(btn);
    }

    // 문장 간 공백
    // $body[0].appendChild(document.createTextNode(" "));
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
// function applyDistortion(pageIndex) {
//   if (pageIndex !== currentPage) return; // 페이지 넘어갔으면 무시
//   const data = PAGES[pageIndex - 1];
//   if (!data || !data.distort) return;

//   const st = pageStates.get(pageIndex);
//   const { index, text } = data.distort;
//   if (!st[index] || st[index].status === "modified") return;

//   st[index] = { text, status: "distorted" };
//   renderSentences(pageIndex);

//   // // 버튼 노출 & 비활성
//   // const $root = getPageRoot(pageIndex);
//   // $root.find(".action-box").show();
//   // $root.find(".action-btn").prop("disabled", true);
// }



// 인라인 수정
// function enterEditMode(spanEl, pageIndex, sentIdx) {
//   const $root = getPageRoot(pageIndex);
//   const $btn = $root.find(".action-btn");

//   spanEl.contentEditable = "true";
//   spanEl.focus();

//   const onInput = () => {
//     const val = spanEl.textContent.trim();
//     $btn.prop("disabled", val.length < MIN_EDIT_LEN);
//   };
//   spanEl.addEventListener("input", onInput);

//   $btn.off("click").on("click", async () => {
//     const newText = spanEl.textContent.trim();
//     if (newText.length < MIN_EDIT_LEN) return;

//     // 상태/UI 반영
//     const st = pageStates.get(pageIndex);
//     st[sentIdx] = { text: newText, status: "modified" };
//     spanEl.classList.remove("distorting");
//     spanEl.contentEditable = "false";
//     $btn.prop("disabled", true);
//     $root.find(".action-box").hide();

// //     // 이미지 교체 (before -> after)
// //     const data = PAGES[pageIndex - 1];
// //     $root.find(".page-image img").attr("src", data.imgAfter);

// //     // TODO: 실제 저장이 필요하면 여기서 fetch 호출
// //     // await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({page: pageIndex, index: sentIdx, text: newText}) });
// //   });

//  // 이미지 교체 (before -> after) + 페이드인
//   const data = PAGES[pageIndex - 1];
//   const $img = $root.find(".page-image img");

//   // 1) 먼저 서서히 사라지게
//   $img.addClass("fading");

//   setTimeout(() => {
//     // 2) 이미지 src 바꾸고
//     $img.attr("src", data.imgAfter);

//     // 3) 다시 서서히 나타나게
//     $img.removeClass("fading");

    
//   }, 300); // 0.3초 뒤에 교체 (transition과 어울리게)
// });
// }

// function applyDistortion(pageIndex) {
//   if (pageIndex !== currentPage) return;
//   const data = PAGES[pageIndex - 1];
//   if (!data || !data.distort) return;

//   const st = pageStates.get(pageIndex);
//   const { index, text: distortedText } = data.distort;

//   // 이미 수정된 문장은 스킵
//   if (!st[index] || st[index].status === "modified") return;

//   // 현재 페이지의 해당 문장 <span> DOM 찾기
//   const $root = getPageRoot(pageIndex);
//   const $body = $root.find(".page-body");
//   if (!$body.length) return;

//   const $spans = $body.find(".sentence");     // 렌더된 문장들
//   const targetSpan = $spans.get(index);       // 왜곡 대상
//   if (!targetSpan) {
//     // 안전장치: 못 찾으면 그냥 즉시 반영 (fallback)
//     st[index] = { text: distortedText, status: "distorted" };
//     renderSentences(pageIndex);
//     return;
//   }

//   // 현재(원본) 텍스트 보장
//   const originalText = st[index].text;
//   targetSpan.textContent = originalText;

//   // 커서 표시 안 하고 싶으면 cursor: '' 로, 보이게 하려면 '|' 등으로
//   const tw = new Typewriter(targetSpan, {
//     autoStart: false,
//     delay: 32,            // 타이핑 속도 (원하면 숫자 조절)
//     cursor: '|'           // 커서 표시 원치 않으면 ''
//   });

//   // 애니메이션: 잠깐 멈춤 → 전부 백스페이스 → 새 문장 타이핑 → 완료 처리
//   tw.pauseFor(250)
//     .deleteAll()                // 백스페이스 애니메이션
//     .typeString(distortedText)  // 왜곡 문장 타이핑
//     .callFunction(() => {
//       // 상태 업데이트: 이제야 'distorted'로 전환
//       st[index] = { text: distortedText, status: "distorted" };

//       // 강조 스타일(굵게/물결 밑줄) 유지
//       targetSpan.classList.add("distorting");
//       targetSpan.contentEditable = "false";

//       // 인라인 아이콘 버튼 추가 (연필 → 편집 진입)
//       // 이미 붙어있지 않은 경우에만
//       if (!targetSpan.nextSibling || 
//           !(targetSpan.nextSibling.classList && targetSpan.nextSibling.classList.contains('action-btn-inline'))) {
//         const btn = document.createElement("button");
//         btn.className = "action-btn-inline";
//         btn.type = "button";
//         btn.setAttribute("aria-label", "문장 수정");
//         btn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
//         btn.addEventListener("click", (e) => {
//           e.stopPropagation();
//           enterEditMode(targetSpan, pageIndex, index, btn);
//         });
//         targetSpan.insertAdjacentElement('afterend', btn);
//         targetSpan.insertAdjacentText('afterend', ' ');
//       }

//       // (선택) 여기서 이미지 전환까지 하고 싶다면:
//       // const $img = $root.find(".page-image img");
//       // $img.addClass("fading");
//       // setTimeout(() => { $img.attr("src", data.imgAfter); $img.removeClass("fading"); }, 300);
//     })
//     .start();
// }

function applyDistortion(pageIndex) {
  if (pageIndex !== currentPage) return;
  // const data = PAGES[pageIndex - 1];
  const data = getDataForPage(pageIndex)
  if (!data || !data.distort) return;

  const st = pageStates.get(pageIndex);
  const { index, text: distortedText } = data.distort;

  // 이미 수정된 문장은 스킵
  if (!st[index] || st[index].status === "modified") return;

  const $root = getPageRoot(pageIndex);
  const $body = $root.find(".page-body");
  if (!$body.length) return;

  const targetSpan = $body.find(".sentence").get(index);
  if (!targetSpan) return;

  // 중복 삽입 방지
  if (targetSpan.dataset.distortedAttached === "1") return;
  targetSpan.dataset.distortedAttached = "1";

  // 🔹 원본(targetSpan)은 그대로 두고, 그 뒤에 왜곡 스팬(ghost)만 추가
  const ghost = document.createElement("span");
  ghost.className = "sentence distorting";
  ghost.textContent = ""; // 타이핑으로 채울 것

  // 원본 뒤에 공백 + ghost 끼워넣기
  // targetSpan.insertAdjacentText("afterend", " ");
  targetSpan.insertAdjacentElement("afterend", ghost);

  // 인라인 아이콘 버튼 (편집)
  const btn = document.createElement("button");
  btn.className = "action-btn-inline";
  btn.type = "button";
  btn.setAttribute("aria-label", "문장 수정");
  btn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    // ghost는 상태에 없으므로 sentIdx = -1로 넘김
    enterEditMode(ghost, pageIndex, -1, btn);
  });
  ghost.insertAdjacentElement("afterend", btn);
  // ghost.insertAdjacentText("afterend", " ");

  // 🔹 요청대로: 백스페이스 없이 "그냥 타이핑만"
  const tw = new Typewriter(ghost, {
    autoStart: false,
    delay: 70,
    cursor: '|' // 커서 싫으면 '' 로
  });

  tw.typeString(distortedText).start();
}


// function enterEditMode(spanEl, pageIndex, sentIdx, btnEl) {
//   // 이미 편집 중이면 무시
//   if (spanEl.isContentEditable) return;

//   // 편집 가능
//   spanEl.contentEditable = "true";
//   spanEl.focus();
//   spanEl.classList.add("distorting"); // 굵게/밑줄 유지

//   // 아이콘을 체크로 교체, 우선 비활성
//   btnEl.innerHTML = '<i class="fas fa-paper-plane"></i>';
//   btnEl.disabled = true;

//   const onInput = () => {
//     const val = spanEl.textContent.trim();
//     btnEl.disabled = val.length < MIN_EDIT_LEN;
//   };
//   spanEl.addEventListener("input", onInput);

//   // 체크(저장) 동작
//   const onSave = () => {
//     const newText = spanEl.textContent.trim();
//     if (newText.length < MIN_EDIT_LEN) return;

//     // 상태 업데이트
//     const st = pageStates.get(pageIndex);
//     st[sentIdx] = { text: newText, status: "modified" };

//     // UI 정리
//     spanEl.classList.remove("distorting");
//     spanEl.contentEditable = "false";
//     spanEl.removeEventListener("input", onInput);

//     // 아이콘 버튼 제거(원하면 숨김 처리로 대체 가능)
//     btnEl.remove();

//     // 이미지 교체 (before → after) + 페이드
//     const $root = getPageRoot(pageIndex);
//     const data = PAGES[pageIndex - 1];
//     const $img = $root.find(".page-image img");
//     $img.addClass("fading");
//     setTimeout(() => {
//       $img.attr("src", data.imgAfter);
//       $img.removeClass("fading");
//     }, 300);
//   };

//   btnEl.addEventListener("click", onSave, { once: true });
// }


// 페이지 로드 (문장/이미지/날짜 초기화 + 왜곡 예약)
// function loadPage(pageIndex) {
//   currentPage = pageIndex;
//   clearDistortion(pageIndex);

//   const data = PAGES[pageIndex - 1];
//   if (!data) return;

//   // 날짜 채우기 (id 혹은 class 둘 다 대응)
//   const date = todayStr();
//   const $root = getPageRoot(pageIndex);
//   const $dates = $root.find(".current-date, #current-date");
//   $dates.text(date);

//   // 이미지 초기화
//   $root.find(".page-image img").attr("src", data.imgBefore);

//   // 버튼 초기화
//   $root.find(".action-box").hide();
//   $root.find(".action-btn").prop("disabled", true);

//   // 문장 상태 초기화
//   pageStates.set(pageIndex, data.sentences.map(t => ({ text: t, status: "original" })));
//   renderSentences(pageIndex);

//   // 왜곡 예약
//   scheduleDistortion(pageIndex);
// }


// document.addEventListener("DOMContentLoaded", () => {
//   const have = getPageCount();
//   const need = PAGES.length;

//   if (have < need) {
//     console.warn(`[app.js] #flipbook .page 개수(${have}) < 데이터 페이지 수(${need}). HTML에 .page를 더 추가하세요.`);
//   }

//   // 첫 페이지 로드
//   loadPage(1);

//   // 페이지 넘길 때마다 현재 페이지 로드 (turn.js가 이미 초기화돼 있다고 가정하고 함)
//   if ($.fn && $.fn.turn) {
//     $("#flipbook").bind("turned", function(_, page){
//       // turn.js는 1-based page index
//       if (page >= 1 && page <= need) loadPage(page);

//       const audio = document.getElementById("pageSound");
//       if (audio) {
//         audio.currentTime = 0; // 첨부터 재생
//         audio.play().catch(err => console.log("Audio play blocked:", err));
//       }
//     });
//   }
// });

function enterEditMode(spanEl, pageIndex, sentIdx, btnEl) {
  if (spanEl.isContentEditable) return;

  const cursor = spanEl.parentNode.querySelector(".Typewriter__cursor");
  if (cursor) cursor.remove();

  spanEl.textContent = "";

  spanEl.contentEditable = "true";
  spanEl.focus();
  spanEl.classList.add("distorting");

  btnEl.innerHTML = '<i class="fas fa-paper-plane"></i>';
  btnEl.disabled = true;

  const onInput = () => {
    const val = spanEl.textContent.trim();
    btnEl.disabled = val.length < MIN_EDIT_LEN;
  };
  spanEl.addEventListener("input", onInput);

  const onSave = () => {
    const newText = spanEl.textContent.trim();
    if (newText.length < MIN_EDIT_LEN) return;

    // 상태 반영은 sentIdx가 유효할 때만
    if (sentIdx >= 0) {
      const st = pageStates.get(pageIndex);
      st[sentIdx] = { text: newText, status: "modified" };
    } else {
      // DOM-only(ghost)일 땐 상태 갱신 없이 DOM만 확정
      // 필요하면 data-속성으로 표시만 남겨도 OK
      spanEl.dataset.modified = "1";
    }

    spanEl.classList.remove("distorting");
    spanEl.contentEditable = "false";
    spanEl.removeEventListener("input", onInput);

    btnEl.remove();

    const cursor = spanEl.parentNode.querySelector('.Typewriter__cursor');
    if (cursor) cursor.remove();

    // 이미지 전환 유지
    const $root = getPageRoot(pageIndex);
    // const data = PAGES[pageIndex - 1];
getDataForPage(pageIndex);
    const $img = $root.find(".page-image img");
    $img.addClass("fading");
    setTimeout(() => {
      $img.attr("src", data.imgAfter);
      $img.removeClass("fading");
    }, 300);
  };

  btnEl.addEventListener("click", onSave, { once: true });
}


document.addEventListener("DOMContentLoaded", () => {
  const have = getPageCount();
  const need = PAGES.length;
  if (have < need) {
    console.warn(`[app.js] #flipbook .page 개수(${have}) < 데이터 페이지 수(${need}). HTML에 .page를 더 추가하세요.`);
  }

  // 1) 모두 먼저 렌더
  initAllPages();

  // 2) 이미지 프리로드
  preloadImages();

  // 3) 현재 페이지 기준 왜곡 타이머 시작
  currentPage = 2;
  scheduleDistortion(2);

  // 4) 페이지 넘길 때 타이머만 관리
  // if ($.fn && $.fn.turn) {
  //   let lastPage = 1;
  //   $("#flipbook").bind("turned", function(_, page){
  //     // 이전 페이지 타이머 정리
  //     clearDistortion(lastPage);

  //     // 현재 페이지 갱신 & 왜곡 예약
  //     currentPage = page;
  //     scheduleDistortion(page);
  //     lastPage = page;

  //     const audio = document.getElementById("pageSound");
  //     if (audio) {
  //       audio.currentTime = 0;
  //       audio.play().catch(() => {});
  //     }
  //   });
  // }
  if ($.fn && $.fn.turn) {
  let lastPage = 1;

  $("#flipbook").bind("turned", function(_, page){
    // 🔧 같은 페이지로의 반복 turned 호출이면 무시
    if (page === lastPage) {
      return;
    }

    // 이전 페이지만 타이머 정리
    clearDistortion(lastPage);

    // 현재 페이지 갱신 & 왜곡 예약
    currentPage = page;
    scheduleDistortion(page);
    lastPage = page;

    const audio = document.getElementById("pageSound");
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  });
}

});
function getDataForPage(pageIndex) {
  const dataIndex = pageIndex - 1 - COVER_OFFSET; // ex) pageIndex=2 -> 0
  return PAGES[dataIndex];
}
