// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드: DOM 컨텐츠 로드됨');
    
    // 모달이 표시되어 있는지 확인하고 숨기기 (최우선)
    const modal = document.getElementById('ai-help-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('초기화: 모달 초기 숨김 처리 완료');
    }
    
    // 모든 화면 요소 가져오기
    const startScreen = document.getElementById('start-screen');
    const difficultyScreen = document.getElementById('difficulty-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    
    console.log('화면 요소 확인:');
    console.log('  start-screen:', startScreen ? '있음' : '없음');
    console.log('  difficulty-screen:', difficultyScreen ? '있음' : '없음');
    console.log('  game-screen:', gameScreen ? '있음' : '없음');
    console.log('  end-screen:', endScreen ? '있음' : '없음');
    
    // 시작 화면만 표시
    if (startScreen) {
        startScreen.classList.remove('hidden');
        startScreen.style.display = 'flex';
        console.log('초기화: 시작 화면 표시');
    }
    
    // UI 초기화
    UI.init();
    console.log('초기화: UI 초기화 완료');
    
    // 게임 초기화 (기본 난이도)
    Game.init('easy');
    console.log('초기화: 게임 초기화 완료');
    
    // AI 도움말 초기화
    if (typeof AIHelper !== 'undefined') {
        AIHelper.init();
        console.log('초기화: AI 도움말 초기화 완료');
    } else {
        console.error('초기화: AIHelper 객체를 찾을 수 없음');
    }
    
    // 컨텍스트 메뉴 비활성화 (우클릭 메뉴 방지)
    document.addEventListener('contextmenu', function(e) {
        if (e.target.classList.contains('cell')) {
            e.preventDefault();
        }
    });
    
    // 모달 닫기 버튼 이벤트
    const closeModalButton = document.getElementById('close-modal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'none';
                console.log('닫기 버튼 클릭: 모달 숨김 처리');
            }
        });
        console.log('초기화: 모달 닫기 버튼 이벤트 등록 완료');
    }
    
    // 모달 외부 클릭 시 닫기 기능
    document.addEventListener('click', function(e) {
        if (modal && e.target === modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
            console.log('모달 외부 클릭: 모달 숨김 처리');
        }
    });
    
    // 키보드 ESC 키로 모달 닫기 기능
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
            console.log('ESC 키 누름: 모달 숨김 처리');
        }
    });
    
    // AI 도움말 버튼 클릭 이벤트
    const aiHelpButton = document.getElementById('ai-help-button');
    if (aiHelpButton) {
        aiHelpButton.addEventListener('click', function() {
            // 게임이 진행 중일 때만 AI 도움말 활성화
            if (Game.gameStarted && !Game.gameOver) {
                if (typeof AIHelper !== 'undefined' && AIHelper.getHint) {
                    AIHelper.getHint();
                    console.log('AI 도움말 버튼 클릭: 힌트 요청됨');
                }
            } else {
                // 게임이 시작되지 않은 경우 알림
                if (modal && typeof AIHelper !== 'undefined') {
                    AIHelper.showModal("게임이 시작된 후에 AI 도움말을 사용할 수 있습니다.");
                    console.log('AI 도움말 버튼 클릭: 게임이 시작되지 않아 힌트 제공 불가');
                }
            }
        });
        console.log('초기화: AI 도움말 버튼 이벤트 등록 완료');
    }
    
    console.log('페이지 초기화 완료');
});