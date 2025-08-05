// 중복 화면 문제 디버깅 및 해결 스크립트
(function() {
    console.log('=== 중복 화면 문제 해결 스크립트 시작 ===');
    
    // DOM이 준비되면 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', troubleshoot);
    } else {
        troubleshoot();
    }
    
    function troubleshoot() {
        console.log('중복 화면 문제 해결 시작...');
        
        // 모든 screen 요소 확인
        const screens = document.querySelectorAll('.screen');
        console.log(`발견된 화면 수: ${screens.length}`);
        
        // 각 화면의 정보 출력
        screens.forEach((screen, index) => {
            console.log(`화면 ${index + 1}: id=${screen.id}, hidden=${screen.classList.contains('hidden')}`);
            console.log(`  display: ${window.getComputedStyle(screen).display}`);
        });
        
        // 각 화면이 제대로 전환될 수 있도록 확인
        const startScreen = document.getElementById('start-screen');
        const difficultyScreen = document.getElementById('difficulty-screen');
        const gameScreen = document.getElementById('game-screen');
        const endScreen = document.getElementById('end-screen');
        
        if (!startScreen || !difficultyScreen || !gameScreen || !endScreen) {
            console.error('필수 화면 요소를 찾을 수 없습니다!');
            return;
        }
        
        // 시작 화면만 표시되도록 보장
        startScreen.classList.remove('hidden');
        difficultyScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        
        console.log('화면 초기 상태 설정 완료');
        console.log('=== 중복 화면 문제 해결 완료 ===');
    }
})();