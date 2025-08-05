// AI 도움말 기능을 담당하는 객체
const AIHelper = {
    // 사용 횟수 제한
    usageCount: 0,
    maxUsage: 3, // 게임당 최대 사용 횟수
    isInitialized: false, // 초기화 여부 확인
    
    // 초기화 - 모달이 자동으로 표시되지 않도록 함
    init: function() {
        if (this.isInitialized) {
            return; // 이미 초기화된 경우 중복 실행 방지
        }
        
        console.log('AIHelper 초기화 시작');
        
        // 모달 초기 상태 확인 및 숨기기 (강제로 처리)
        const modal = document.getElementById('ai-help-modal');
        if (modal) {
            // 클래스 방식 대신 직접 style 속성 설정 (더 우선순위가 높음)
            modal.style.display = 'none';
            console.log('모달 숨김 처리 완료 (style 직접 설정)');
            
            // 모달이 정말 숨겨졌는지 확인
            setTimeout(() => {
                if (window.getComputedStyle(modal).display !== 'none') {
                    console.error('모달이 여전히 표시되어 있음, 다시 시도');
                    modal.style.display = 'none !important';
                    document.body.style.overflow = 'auto'; // 혹시 모달로 인해 스크롤이 막혔다면 복구
                }
            }, 100);
        } else {
            console.error('모달 요소를 찾을 수 없음');
        }
        
        // AI 도움말 버튼이 게임 시작 전에는 비활성화되도록 설정
        const aiHelpButton = document.getElementById('ai-help-button');
        if (aiHelpButton) {
            if (!Game || !Game.gameStarted) {
                aiHelpButton.disabled = true;
                aiHelpButton.classList.add('disabled');
                console.log('AI 도움말 버튼 비활성화 (게임이 시작되지 않음)');
            }
        } else {
            console.error('AI 도움말 버튼을 찾을 수 없음');
        }
        
        // 닫기 버튼에 이벤트 리스너 직접 등록
        const closeButton = document.getElementById('close-modal');
        if (closeButton) {
            // 이전 리스너 제거 후 새로 등록
            closeButton.removeEventListener('click', this.closeModalHandler);
            
            // 직접 핸들러 함수 정의 (UI 객체에 의존하지 않음)
            this.closeModalHandler = () => {
                const modal = document.getElementById('ai-help-modal');
                if (modal) {
                    modal.style.display = 'none';
                    console.log('닫기 버튼 클릭으로 모달 숨김');
                }
            };
            
            closeButton.addEventListener('click', this.closeModalHandler);
            console.log('닫기 버튼에 새 이벤트 리스너 등록 완료');
        }
        
        this.usageCount = 0; // 사용 횟수 초기화
        this.isInitialized = true; // 초기화 완료 표시
        console.log('AIHelper 초기화 완료');
    },
    
    // 게임 시작 시 호출되는 메소드 (버튼 활성화)
    onGameStart: function() {
        const aiHelpButton = document.getElementById('ai-help-button');
        if (aiHelpButton) {
            aiHelpButton.disabled = false;
            aiHelpButton.classList.remove('disabled');
            console.log('AI 도움말 버튼 활성화 (게임 시작됨)');
        }
    },
    
    // 현재 게임 상태 분석 및 힌트 제공
    getHint: function() {
        console.log('AI 도움말 힌트 요청됨');
        
        // 게임이 시작되지 않았거나 종료된 경우
        if (!Game || !Game.gameStarted || Game.gameOver) {
            this.showModal("게임이 아직 시작되지 않았거나 이미 종료되었습니다. 새 게임을 시작해보세요!");
            console.log('힌트 제공 불가: 게임 상태 확인 필요');
            return;
        }
        
        // 사용 횟수 제한 확인 - 이미 3번 사용한 경우
        if (this.usageCount >= this.maxUsage) {
            this.showModal(`AI 도움말은 게임당 ${this.maxUsage}번만 사용 가능합니다. 이미 ${this.maxUsage}번 모두 사용하셨습니다. 다음 게임에서 다시 사용해보세요!`);
            console.log('힌트 제공 불가: 사용 횟수 초과 (사용: ' + this.usageCount + ', 최대: ' + this.maxUsage + ')');
            return;
        }
        
        // 게임 상태 분석
        const analysis = Game.analyzeGameState();
        
        // 힌트 메시지 생성
        let hintMessage = this.generateHintMessage(analysis);
        
        // 사용 횟수 증가
        this.usageCount++;
        
        // 남은 사용 횟수 표시
        const remainingUsage = this.maxUsage - this.usageCount;
        hintMessage += `\n\n(AI 도움말 사용 횟수: ${this.usageCount}/${this.maxUsage}회, 남은 횟수: ${remainingUsage}회)`;
        
        // 모달 표시
        this.showModal(hintMessage);
        
        // 도움말 사용 시 게임 보드에 힌트 표시 (시각적 효과)
        this.highlightHints(analysis);
        
        console.log('힌트 제공 완료: 사용 횟수 ' + this.usageCount + '/' + this.maxUsage);
    },
    
    // 모달 직접 표시 (UI 객체에 의존하지 않음)
    showModal: function(message) {
        const modal = document.getElementById('ai-help-modal');
        const messageElement = document.getElementById('ai-help-message');
        
        if (!modal || !messageElement) {
            console.error('모달 또는 메시지 요소를 찾을 수 없음');
            return;
        }
        
        // 메시지 설정
        messageElement.textContent = message;
        
        // 모달 표시 (직접 스타일 설정)
        modal.style.display = 'flex';
        console.log('모달 표시됨');
        
        // 모달이 표시되었는지 확인
        setTimeout(() => {
            if (window.getComputedStyle(modal).display !== 'flex') {
                console.error('모달이 표시되지 않음, 다시 시도');
                modal.style.display = 'flex !important';
            }
        }, 50);
    },
    
    // 힌트 메시지 생성
    generateHintMessage: function(analysis) {
        let message = "📊 게임 분석 결과:\n\n";
        
        // 기본 힌트 추가
        message += analysis.message;
        
        // 게임 상태에 따른 추가 정보
        const { rows, cols } = Game.config[Game.difficulty];
        const totalCells = rows * cols;
        const remainingCells = totalCells - Game.revealedCount - Game.minesCount;
        const progress = ((Game.revealedCount / (totalCells - Game.minesCount)) * 100).toFixed(1);
        
        message += `\n\n🔍 게임 진행 상황: ${progress}% 완료`;
        message += `\n💣 남은 지뢰: ${Game.minesCount - Game.flagsCount}개`;
        message += `\n🚩 표시한 깃발: ${Game.flagsCount}개`;
        message += `\n⬜ 남은 셀: ${remainingCells}개`;
        
        // 타이머 정보
        const timeRemaining = 999 - Timer.getTime();
        if (timeRemaining < 100) {
            message += `\n⏱️ 주의: 시간이 ${timeRemaining}초 남았습니다!`;
        }
        
        // 전략 팁
        message += "\n\n💡 전략 팁: ";
        const tips = [
            "모서리와 가장자리부터 열어보는 것이 일반적으로 안전합니다.",
            "숫자 주변의 닫힌 셀 개수와 숫자가 같으면 모든 셀에 지뢰가 있습니다.",
            "한 셀 주변의 지뢰 수와 이미 표시한 깃발 수가 같으면 나머지 셀은 안전합니다.",
            "확실하지 않을 때는 확률이 가장 낮은 셀을 선택하세요.",
            "1이 있는 셀 주변에는 하나의 지뢰만 있습니다.",
            "숫자 패턴에 주목하면 논리적으로 지뢰 위치를 추론할 수 있습니다."
        ];
        
        // 랜덤 팁 선택
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        message += randomTip;
        
        return message;
    },
    
    // 힌트 시각적으로 표시
    highlightHints: function(analysis) {
        // 안전한 셀 하이라이트
        if (analysis.safeCells && analysis.safeCells.length > 0) {
            analysis.safeCells.forEach(pos => {
                const cellElement = UI.getCellElement(pos.row, pos.col);
                if (cellElement) {
                    cellElement.style.boxShadow = "0 0 10px rgba(0, 255, 0, 0.8)";
                    cellElement.classList.add('hint-safe');
                    
                    // 잠시 후 하이라이트 제거
                    setTimeout(() => {
                        cellElement.style.boxShadow = "";
                        cellElement.classList.remove('hint-safe');
                    }, 3000);
                }
            });
        }
        
        // 지뢰가 있을 가능성이 높은 셀 하이라이트
        if (analysis.probableMines && analysis.probableMines.length > 0) {
            analysis.probableMines.forEach(pos => {
                const cellElement = UI.getCellElement(pos.row, pos.col);
                if (cellElement) {
                    cellElement.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.8)";
                    cellElement.classList.add('hint-mine');
                    
                    // 잠시 후 하이라이트 제거
                    setTimeout(() => {
                        cellElement.style.boxShadow = "";
                        cellElement.classList.remove('hint-mine');
                    }, 3000);
                }
            });
        }
    },
    
    // 게임 재시작 시 사용 횟수 초기화
    reset: function() {
        this.usageCount = 0;
        console.log('AI 도움말 사용 횟수 초기화됨');
        
        // 모달 숨기기 (초기화 시)
        const modal = document.getElementById('ai-help-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
};