// 모바일 환경 지원을 위한 추가 기능
document.addEventListener('DOMContentLoaded', function() {
    console.log('모바일 지원 기능 초기화');

    // 모바일 환경인지 확인
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('모바일 환경 감지됨: 추가 기능 활성화');
        
        // 모바일 환경에서는 게임 보드 상단에 깃발 모드 토글 버튼 추가
        const gameHeader = document.querySelector('.game-header');
        if (gameHeader) {
            const flagModeToggle = document.createElement('button');
            flagModeToggle.id = 'flag-mode-toggle';
            flagModeToggle.className = 'btn flag-mode-btn';
            flagModeToggle.textContent = '🚩';
            flagModeToggle.title = '깃발 모드 (꾹 누르기 대신 사용)';
            
            // 맨 앞에 추가
            gameHeader.insertBefore(flagModeToggle, gameHeader.firstChild);
            
            // 전역 변수로 깃발 모드 상태 관리
            window.isFlagMode = false;
            
            // 깃발 모드 토글 버튼 이벤트
            flagModeToggle.addEventListener('click', function() {
                window.isFlagMode = !window.isFlagMode;
                
                if (window.isFlagMode) {
                    flagModeToggle.classList.add('active');
                    flagModeToggle.title = '깃발 모드 활성화됨 (클릭하여 비활성화)';
                } else {
                    flagModeToggle.classList.remove('active');
                    flagModeToggle.title = '깃발 모드 (꾹 누르기 대신 사용)';
                }
                
                console.log('깃발 모드 ' + (window.isFlagMode ? '활성화' : '비활성화'));
            });
            
            // 셀 클릭 이벤트 재정의
            document.querySelectorAll('.cell').forEach(cell => {
                cell.addEventListener('click', function(e) {
                    if (Game.gameOver) return;
                    
                    const row = parseInt(this.dataset.row);
                    const col = parseInt(this.dataset.col);
                    
                    // 깃발 모드일 때는 깃발 토글
                    if (window.isFlagMode) {
                        Game.toggleFlag(row, col);
                        UI.updateCell(row, col);
                    } else {
                        // 일반 모드일 때는 셀 열기
                        Game.revealCell(row, col);
                        UI.updateCell(row, col);
                    }
                });
            });
        }
        
        // 모바일에서 더블 탭 방지
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchend', function(e) {
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;
            
            if (window.lastTap && (now - window.lastTap) < DOUBLE_TAP_DELAY) {
                e.preventDefault();
            }
            
            window.lastTap = now;
        }, { passive: false });
    }
});