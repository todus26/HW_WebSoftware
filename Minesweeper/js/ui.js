// UI 관련 기능을 담당하는 객체
const UI = {
    // UI 초기화
    init: function() {
        // 화면 요소
        this.startScreen = document.getElementById('start-screen');
        this.difficultyScreen = document.getElementById('difficulty-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');
        this.gameBoard = document.getElementById('game-board');
        this.mineCount = document.getElementById('mine-count');
        this.timerDisplay = document.getElementById('timer-display');
        this.restartButton = document.getElementById('restart-button');
        this.endMessage = document.getElementById('end-message');
        this.timeSpent = document.getElementById('time-spent');
        this.aiHelpModal = document.getElementById('ai-help-modal');
        this.aiHelpMessage = document.getElementById('ai-help-message');
        
        // 버튼 이벤트 리스너 등록
        this.setupEventListeners();
    },
    
    // 이벤트 리스너 설정
    setupEventListeners: function() {
        // 시작 화면 버튼
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.showScreen(this.difficultyScreen);
            });
        }
        
        // 난이도 선택 버튼
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const difficulty = button.getAttribute('data-difficulty');
                this.startGame(difficulty);
            });
        });
        
        // 재시작 버튼
        this.restartButton.addEventListener('click', () => {
            this.showScreen(this.difficultyScreen);
        });
        
        // 뒤로가기 버튼
        const backToStartButton = document.getElementById('back-to-start');
        if (backToStartButton) {
            backToStartButton.addEventListener('click', () => {
                this.showScreen(this.startScreen);
            });
        }
        
        const backToDifficultyButton = document.getElementById('back-to-difficulty');
        if (backToDifficultyButton) {
            backToDifficultyButton.addEventListener('click', () => {
                Timer.stop();
                this.showScreen(this.difficultyScreen);
            });
        }
        
        // 게임 종료 화면 버튼
        const playAgainButton = document.getElementById('play-again');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                const currentDifficulty = Game.difficulty;
                this.startGame(currentDifficulty);
            });
        }
        
        const backToMainButton = document.getElementById('back-to-main');
        if (backToMainButton) {
            backToMainButton.addEventListener('click', () => {
                this.showScreen(this.startScreen);
            });
        }
        
        // AI 도움말 버튼 - main.js에서 처리하므로 여기서는 제거
        /*
        const aiHelpButton = document.getElementById('ai-help-button');
        if (aiHelpButton) {
            aiHelpButton.addEventListener('click', () => {
                // AIHelper가 사용 가능한지 확인
                if (typeof AIHelper !== 'undefined' && AIHelper.getHint) {
                    AIHelper.getHint();
                } else {
                    console.error('AIHelper 객체 또는 getHint 메소드를 찾을 수 없음');
                }
            });
        }
        */
        
        // 모달 닫기 버튼 - main.js에서 처리하므로 여기서는 제거
        /*
        const closeModalButton = document.getElementById('close-modal');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                this.hideModal();
            });
        }
        */
    },
    
    // 특정 화면 표시
    showScreen: function(screen) {
        console.log(`화면 전환 시도: ${screen ? screen.id : 'undefined'}`);
        
        // 모든 화면 숨기기
        this.startScreen.classList.add('hidden');
        this.difficultyScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        
        // 디버그 정보
        console.log('모든 화면 숨김 처리 완료');
        
        // 요청한 화면 표시
        if (screen) {
            screen.classList.remove('hidden');
            console.log(`${screen.id} 화면 표시됨`);
            
            // display 스타일 명시적 설정
            screen.style.display = 'flex';
            
            // 확인
            const isHidden = screen.classList.contains('hidden');
            const displayStyle = window.getComputedStyle(screen).display;
            console.log(`확인 - ${screen.id}: hidden=${isHidden}, display=${displayStyle}`);
        } else {
            console.error('표시할 화면이 null입니다');
        }
    },
    
    // 게임 시작
    startGame: function(difficulty) {
        // 게임 로직 초기화
        Game.init(difficulty);
        
        // 게임 보드 크기 설정
        this.setupGameBoard();
        
        // 타이머 초기화
        Timer.reset();
        
        // 게임 화면 표시
        this.showScreen(this.gameScreen);
        
        // 이모지 초기화
        this.updateFace('😊');
        
        // AI 도움말 버튼 상태 설정 (초기에는 비활성화)
        const aiHelpButton = document.getElementById('ai-help-button');
        if (aiHelpButton) {
            aiHelpButton.disabled = true;
            aiHelpButton.classList.add('disabled');
            aiHelpButton.title = "게임을 시작하면 AI 도움말을 사용할 수 있습니다.";
        }
        
        // AI 도움말 사용 횟수 초기화
        if (typeof AIHelper !== 'undefined' && AIHelper.reset) {
            AIHelper.reset();
            console.log('AI 도움말 초기화: 사용 횟수 재설정');
        }
        
        console.log('게임 화면 준비 완료: 난이도 ' + difficulty);
    },
    
    // 게임 보드 설정
    setupGameBoard: function() {
        const { rows, cols } = Game.config[Game.difficulty];
        
        // 기존 보드 비우기
        this.gameBoard.innerHTML = '';
        
        // 그리드 설정
        this.gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        this.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        // 셀 생성
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // 셀 클릭 이벤트
                cell.addEventListener('click', (e) => {
                    if (!Game.gameOver) {
                        const row = parseInt(e.target.dataset.row);
                        const col = parseInt(e.target.dataset.col);
                        Game.revealCell(row, col);
                        this.updateCell(row, col);
                    }
                });
                
                // 우클릭 이벤트 (깃발 표시)
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // 기본 컨텍스트 메뉴가 표시되지 않도록 방지
                    
                    if (!Game.gameOver) {
                        const row = parseInt(e.target.dataset.row);
                        const col = parseInt(e.target.dataset.col);
                        
                        console.log(`우클릭 이벤트 발생: 위치 (${row}, ${col})`); // 디버그 로그
                        
                        Game.toggleFlag(row, col);
                        this.updateCell(row, col);
                    }
                    
                    return false; // 추가로 이벤트 버블링 방지
                });
                
                // 모바일 용 길게 누르기 (깃발 표시)
                let longPressTimer;
                cell.addEventListener('touchstart', (e) => {
                    if (!Game.gameOver) {
                        longPressTimer = setTimeout(() => {
                            const row = parseInt(e.target.dataset.row);
                            const col = parseInt(e.target.dataset.col);
                            Game.toggleFlag(row, col);
                            this.updateCell(row, col);
                        }, 500);
                    }
                });
                
                cell.addEventListener('touchend', () => {
                    clearTimeout(longPressTimer);
                });
                
                cell.addEventListener('touchmove', () => {
                    clearTimeout(longPressTimer);
                });
                
                this.gameBoard.appendChild(cell);
            }
        }
    },
    
    // 셀 업데이트
    updateCell: function(row, col) {
        const cellElement = this.getCellElement(row, col);
        const cell = Game.board[row][col];
        
        // 클래스 초기화
        cellElement.className = 'cell';
        
        // 셀 상태에 따른 클래스 추가
        if (cell.isRevealed) {
            cellElement.classList.add('revealed');
            
            if (cell.isMine) {
                cellElement.classList.add('mine');
            } else if (cell.count > 0) {
                // 주변 지뢰 수가 있는 경우 숫자 표시
                cellElement.textContent = cell.count;
                cellElement.dataset.count = cell.count;
            } else {
                // 주변 지뢰가 없는 빈칸인 경우
                cellElement.textContent = '';
            }
        } else if (cell.isFlagged) {
            cellElement.classList.add('flagged');
            cellElement.textContent = '';
        } else {
            // 닫힌 상태 (초기 상태)
            cellElement.textContent = '';
        }
    },
    
    // 셀 요소 가져오기
    getCellElement: function(row, col) {
        return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    },
    
    // 잘못된 깃발 표시
    markWrongFlag: function(row, col) {
        const cellElement = this.getCellElement(row, col);
        cellElement.style.backgroundColor = '#ffaaaa';
    },
    
    // 지뢰 카운터 업데이트
    updateMineCounter: function(count) {
        count = Math.max(0, count);
        this.mineCount.textContent = count.toString().padStart(3, '0');
    },
    
    // 재시작 버튼 이모지 업데이트
    updateFace: function(face) {
        this.restartButton.textContent = face;
    },
    
    // 게임 종료 화면 표시
    showEndScreen: function(message, time) {
        this.endMessage.textContent = message;
        this.timeSpent.textContent = time.toString().padStart(3, '0');
        this.showScreen(this.endScreen);
    },
    
    // AI 도움말 모달 표시
    showModal: function(message) {
        // 모달 내용 설정
        if (this.aiHelpMessage) {
            this.aiHelpMessage.textContent = message;
        } else {
            console.error('AI 도움말 메시지 요소를 찾을 수 없음');
            return;
        }
        
        // 모달 표시
        if (this.aiHelpModal) {
            // 클래스 방식 대신 직접 스타일 설정
            this.aiHelpModal.style.display = 'flex';
            
            // 모달이 표시되었는지 확인
            if (this.aiHelpModal.style.display !== 'flex') {
                console.error('모달이 표시되지 않았습니다.');
            } else {
                console.log('모달이 성공적으로 표시되었습니다.');
            }
        } else {
            console.error('AI 도움말 모달 요소를 찾을 수 없음');
            return;
        }
        
        // 닫기 버튼 이벤트 재확인
        const closeButton = document.getElementById('close-modal');
        if (closeButton) {
            // 기존 이벤트 제거 후 다시 등록
            closeButton.removeEventListener('click', this.hideModal.bind(this));
            closeButton.addEventListener('click', this.hideModal.bind(this));
            
            // 클릭 가능한지 확인
            closeButton.style.pointerEvents = 'auto';
            closeButton.style.cursor = 'pointer';
            
            console.log('닫기 버튼 이벤트 등록 완료');
        } else {
            console.error('닫기 버튼 요소를 찾을 수 없음');
        }
    },
    
    // 모달 숨기기
    hideModal: function() {
        if (this.aiHelpModal) {
            this.aiHelpModal.style.display = 'none';
            console.log('모달 숨김 처리 완료');
        } else {
            console.error('AI 도움말 모달 요소를 찾을 수 없음');
        }
    }
};