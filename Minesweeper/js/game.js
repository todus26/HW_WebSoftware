// 게임 상태를 관리하는 객체
const Game = {
    // 게임 설정
    config: {
        easy: { rows: 9, cols: 9, mines: 10 },
        medium: { rows: 16, cols: 16, mines: 40 },
        hard: { rows: 16, cols: 30, mines: 99 }
    },
    
    // 게임 상태 변수
    board: [],           // 게임 보드 배열
    difficulty: 'easy',  // 현재 난이도
    minesCount: 0,       // 지뢰 수
    flagsCount: 0,       // 깃발 수
    revealedCount: 0,    // 열린 셀 수
    gameStarted: false,  // 게임 시작 여부
    gameOver: false,     // 게임 종료 여부
    firstClick: true,    // 첫 클릭 여부
    
    // 게임 초기화
    init: function(difficulty) {
        console.log('게임 초기화 시작: 난이도 ' + difficulty);
        
        this.difficulty = difficulty;
        this.minesCount = this.config[difficulty].mines;
        this.flagsCount = 0;
        this.revealedCount = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.firstClick = true;
        this.board = [];
        
        // 보드 생성
        this.createBoard();
        
        // UI 업데이트
        UI.updateMineCounter(this.minesCount - this.flagsCount);
        UI.updateFace('😊');
        
        // AI 도움말 초기화
        if (typeof AIHelper !== 'undefined' && AIHelper.reset) {
            AIHelper.reset();
            
            // AI 도움말 버튼 비활성화 (게임 시작 전)
            const aiHelpButton = document.getElementById('ai-help-button');
            if (aiHelpButton) {
                aiHelpButton.disabled = true;
                aiHelpButton.classList.add('disabled');
                console.log('AI 도움말 버튼 비활성화 (게임 초기화 시)');
            }
        }
        
        console.log('게임 초기화 완료: 난이도 ' + difficulty);
    },
    
    // 보드 생성
    createBoard: function() {
        const { rows, cols } = this.config[this.difficulty];
        
        // 빈 보드 생성
        for (let i = 0; i < rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < cols; j++) {
                this.board[i][j] = {
                    row: i,
                    col: j,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    count: 0
                };
            }
        }
        
        console.log('게임 보드 생성 완료: ' + rows + 'x' + cols);
    },
    
    // 지뢰 배치 (첫 클릭 후)
    placeMines: function(firstRow, firstCol) {
        const { rows, cols, mines } = this.config[this.difficulty];
        let minesPlaced = 0;
        
        // 첫 클릭 위치와 그 주변에는 지뢰를 배치하지 않음
        const safeZone = [];
        for (let i = Math.max(0, firstRow - 1); i <= Math.min(rows - 1, firstRow + 1); i++) {
            for (let j = Math.max(0, firstCol - 1); j <= Math.min(cols - 1, firstCol + 1); j++) {
                safeZone.push({ row: i, col: j });
            }
        }
        
        // 지뢰 무작위 배치
        while (minesPlaced < mines) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            
            // 이미 지뢰가 있거나 안전 지대인 경우 건너뜀
            if (this.board[row][col].isMine || safeZone.some(pos => pos.row === row && pos.col === col)) {
                continue;
            }
            
            this.board[row][col].isMine = true;
            minesPlaced++;
        }
        
        // 주변 지뢰 수 계산
        this.calculateNumbers();
        
        console.log('지뢰 배치 완료: ' + mines + '개');
    },
    
    // 각 셀의 주변 지뢰 수 계산
    calculateNumbers: function() {
        const { rows, cols } = this.config[this.difficulty];
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (this.board[i][j].isMine) continue;
                
                let count = 0;
                // 주변 8방향 체크
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        if (di === 0 && dj === 0) continue;
                        
                        const ni = i + di;
                        const nj = j + dj;
                        
                        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && this.board[ni][nj].isMine) {
                            count++;
                        }
                    }
                }
                
                this.board[i][j].count = count;
            }
        }
        
        console.log('주변 지뢰 수 계산 완료');
    },
    
    // 셀 열기
    revealCell: function(row, col) {
        // 이미 게임이 종료되었거나, 이미 열려있거나, 깃발이 표시된 셀은 열지 않음
        if (this.gameOver || this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
            return;
        }
        
        // 첫 클릭인 경우 지뢰 배치
        if (this.firstClick) {
            this.firstClick = false;
            this.gameStarted = true;
            Timer.start();
            this.placeMines(row, col);
            
            // 게임이 시작되면 AI 도움말 버튼 활성화
            if (typeof AIHelper !== 'undefined' && AIHelper.onGameStart) {
                AIHelper.onGameStart();
                console.log('게임 시작: AI 도움말 버튼 활성화');
            } else {
                // AIHelper가 없거나 onGameStart 메소드가 없는 경우 직접 버튼 활성화
                const aiHelpButton = document.getElementById('ai-help-button');
                if (aiHelpButton) {
                    aiHelpButton.disabled = false;
                    aiHelpButton.classList.remove('disabled');
                    console.log('게임 시작: AI 도움말 버튼 직접 활성화');
                }
            }
            
            console.log('게임 시작: 첫 번째 셀 열림');
        }
        
        const cell = this.board[row][col];
        cell.isRevealed = true;
        this.revealedCount++;
        
        // 셀 클릭 애니메이션 실행
        Animation.revealCell(row, col);
        
        // 지뢰를 클릭한 경우 게임 오버
        if (cell.isMine) {
            this.gameOver = true;
            Animation.explode(row, col);
            this.revealAllMines();
            Timer.stop();
            setTimeout(() => {
                UI.showEndScreen('게임 오버! 💣', Timer.getTime());
                UI.updateFace('😵');
            }, 1000);
            return;
        }
        
        // UI 업데이트 (숫자 또는 빈칸 표시)
        UI.updateCell(row, col);
        
        // 빈 셀(주변 지뢰 수가 0)인 경우 주변 셀 자동 열기
        if (cell.count === 0) {
            const { rows, cols } = this.config[this.difficulty];
            
            // 주변 8방향 체크
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue; // 자기 자신은 건너뜀
                    
                    const ni = row + di;
                    const nj = col + dj;
                    
                    // 유효한 범위 내의 셀이고 아직 열리지 않은 경우만 처리
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && !this.board[ni][nj].isRevealed) {
                        // 재귀적으로 주변 셀도 열기
                        this.revealCell(ni, nj);
                    }
                }
            }
        }
        
        // 승리 조건 체크
        this.checkWin();
    },
    
    // 깃발 표시/제거
    toggleFlag: function(row, col) {
        console.log(`toggleFlag 호출됨: 위치 (${row}, ${col})`); // 디버그 로그
        
        // 유효한 셀 위치인지 확인
        if (row < 0 || row >= this.config[this.difficulty].rows || 
            col < 0 || col >= this.config[this.difficulty].cols) {
            console.error(`유효하지 않은 셀 위치: (${row}, ${col})`);
            return;
        }
        
        // 게임 종료 또는 이미 열린 셀인 경우 동작하지 않음
        if (this.gameOver || this.board[row][col].isRevealed) {
            console.log(`플래그 토글 취소: 게임 종료=${this.gameOver}, 셀 열림=${this.board[row][col].isRevealed}`);
            return;
        }
        
        // 게임 시작 처리
        if (!this.gameStarted) {
            this.gameStarted = true;
            Timer.start();
            
            // 게임이 시작되면 AI 도움말 버튼 활성화
            if (typeof AIHelper !== 'undefined' && AIHelper.onGameStart) {
                AIHelper.onGameStart();
            } else {
                // AIHelper가 없거나 onGameStart 메소드가 없는 경우 직접 버튼 활성화
                const aiHelpButton = document.getElementById('ai-help-button');
                if (aiHelpButton) {
                    aiHelpButton.disabled = false;
                    aiHelpButton.classList.remove('disabled');
                }
            }
            
            console.log('깃발 표시로 게임 시작됨');
        }
        
        const cell = this.board[row][col];
        
        // 깃발 토글 (표시/제거)
        if (cell.isFlagged) {
            cell.isFlagged = false;
            this.flagsCount--;
            console.log(`깃발 제거됨: 위치 (${row}, ${col}), 남은 깃발: ${this.minesCount - this.flagsCount}`);
            Animation.removeFlag(row, col);
        } else {
            // 지뢰 수보다 깃발이 많으면 추가 금지
            if (this.flagsCount >= this.minesCount) {
                console.log(`깃발 표시 실패: 최대 깃발 수 (${this.minesCount}) 도달`);
                return;
            }
            
            cell.isFlagged = true;
            this.flagsCount++;
            console.log(`깃발 표시됨: 위치 (${row}, ${col}), 남은 깃발: ${this.minesCount - this.flagsCount}`);
            Animation.placeFlag(row, col);
        }
        
        // 지뢰 카운터 업데이트
        UI.updateMineCounter(this.minesCount - this.flagsCount);
        
        // 승리 조건 체크
        this.checkWin();
    },
    
    // 모든 지뢰 공개
    revealAllMines: function() {
        const { rows, cols } = this.config[this.difficulty];
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = this.board[i][j];
                
                if (cell.isMine && !cell.isRevealed) {
                    cell.isRevealed = true;
                    UI.updateCell(i, j);
                    
                    // 잘못 표시한 깃발 표시
                    if (cell.isFlagged) {
                        UI.markWrongFlag(i, j);
                    }
                }
            }
        }
        
        console.log('모든 지뢰 공개됨');
    },
    
    // 승리 조건 확인
    checkWin: function() {
        const { rows, cols } = this.config[this.difficulty];
        const totalCells = rows * cols;
        
        // 모든 일반 셀이 열렸거나, 모든 지뢰에 깃발이 표시된 경우 승리
        if (this.revealedCount === totalCells - this.minesCount) {
            this.gameOver = true;
            Timer.stop();
            
            // 남은 지뢰에 모두 깃발 표시
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const cell = this.board[i][j];
                    if (cell.isMine && !cell.isFlagged) {
                        cell.isFlagged = true;
                        UI.updateCell(i, j);
                    }
                }
            }
            
            // 지뢰 카운터 업데이트
            UI.updateMineCounter(0);
            
            // 승리 애니메이션 및 화면 표시
            Animation.win();
            setTimeout(() => {
                UI.showEndScreen('승리! 🎉', Timer.getTime());
                UI.updateFace('😎');
            }, 1000);
            
            console.log('게임 승리!');
        }
    },
    
    // 현재 게임 상태 분석 (AI 도움말용)
    analyzeGameState: function() {
        if (!this.gameStarted || this.gameOver) {
            return { message: "게임이 시작되지 않았거나 이미 종료되었습니다." };
        }
        
        const { rows, cols } = this.config[this.difficulty];
        let safeCells = [];
        let probableMines = [];
        
        // 열린 셀 주변에 아직 열리지 않은 셀 분석
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = this.board[i][j];
                
                if (cell.isRevealed && cell.count > 0) {
                    // 주변 열리지 않은 셀과 깃발 수 계산
                    let unopenedCount = 0;
                    let flagCount = 0;
                    let unopenedCells = [];
                    
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di === 0 && dj === 0) continue;
                            
                            const ni = i + di;
                            const nj = j + dj;
                            
                            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                                const neighbor = this.board[ni][nj];
                                
                                if (!neighbor.isRevealed) {
                                    unopenedCount++;
                                    unopenedCells.push({ row: ni, col: nj });
                                }
                                
                                if (neighbor.isFlagged) {
                                    flagCount++;
                                }
                            }
                        }
                    }
                    
                    // 주변 지뢰 수와 깃발 수가 같으면 나머지 셀은 안전
                    if (cell.count === flagCount && unopenedCount > flagCount) {
                        unopenedCells.forEach(pos => {
                            if (!this.board[pos.row][pos.col].isFlagged) {
                                safeCells.push(pos);
                            }
                        });
                    }
                    
                    // 열리지 않은 셀 수와 (지뢰 수 - 깃발 수)가 같으면 나머지 열리지 않은 셀에는 지뢰가 있음
                    if (unopenedCount === cell.count - flagCount) {
                        unopenedCells.forEach(pos => {
                            if (!this.board[pos.row][pos.col].isFlagged) {
                                probableMines.push(pos);
                            }
                        });
                    }
                }
            }
        }
        
        // 중복 제거
        safeCells = Array.from(new Set(safeCells.map(pos => JSON.stringify(pos))))
            .map(str => JSON.parse(str));
        
        probableMines = Array.from(new Set(probableMines.map(pos => JSON.stringify(pos))))
            .map(str => JSON.parse(str));
            
        // 힌트 메시지 생성
        let message = '';
        
        if (safeCells.length > 0) {
            const safePos = safeCells[0];
            message += `${safePos.row + 1}행 ${safePos.col + 1}열을 클릭하는 것이 안전합니다. `;
        } else if (probableMines.length > 0) {
            const minePos = probableMines[0];
            message += `${minePos.row + 1}행 ${minePos.col + 1}열에 지뢰가 있을 가능성이 높습니다. 깃발을 표시하세요. `;
        } else {
            // 가장 가능성이 높은 안전한 셀 추천 (확률적 접근)
            // 현재 게임 상태 기반 추론
            message += "명확한 안전 지역이 없습니다. 확률적으로 위험이 적은 지역을 선택해보세요. ";
            
            // 모서리나 가장자리 셀 중 아직 열리지 않은 셀 추천
            let edgeCells = [];
            
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    if (!this.board[i][j].isRevealed && !this.board[i][j].isFlagged) {
                        // 가장자리 셀인지 확인
                        if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
                            edgeCells.push({ row: i, col: j });
                        }
                    }
                }
            }
            
            if (edgeCells.length > 0) {
                const randIndex = Math.floor(Math.random() * edgeCells.length);
                const edgePos = edgeCells[randIndex];
                message += `시도해볼만한 위치: ${edgePos.row + 1}행 ${edgePos.col + 1}열`;
            } else {
                // 그 외 랜덤한 미개방 셀 추천
                let unopenedCells = [];
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        if (!this.board[i][j].isRevealed && !this.board[i][j].isFlagged) {
                            unopenedCells.push({ row: i, col: j });
                        }
                    }
                }
                
                if (unopenedCells.length > 0) {
                    const randIndex = Math.floor(Math.random() * unopenedCells.length);
                    const randomPos = unopenedCells[randIndex];
                    message += `운에 맡겨 시도해볼만한 위치: ${randomPos.row + 1}행 ${randomPos.col + 1}열`;
                }
            }
        }
        
        console.log('게임 상태 분석 완료: 안전한 셀 ' + safeCells.length + '개, 예상 지뢰 ' + probableMines.length + '개');
        return { message, safeCells, probableMines };
    }
};