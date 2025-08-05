// 애니메이션 효과를 담당하는 객체
const Animation = {
    // 셀 열기 애니메이션
    revealCell: function(row, col) {
        const cellElement = UI.getCellElement(row, col);
        
        // 블록 떨어지는 효과
        if (!Game.board[row][col].isMine) {
            this.createFallingBlocks(cellElement);
        }
    },
    
    // 블록 떨어지는 효과 생성
    createFallingBlocks: function(cellElement) {
        const rect = cellElement.getBoundingClientRect();
        const fragments = 6; // 조각 수
        
        for (let i = 0; i < fragments; i++) {
            const fragment = document.createElement('div');
            fragment.className = 'cell-fragment';
            
            // 랜덤 위치 및 크기
            const size = 5 + Math.random() * 5;
            fragment.style.width = `${size}px`;
            fragment.style.height = `${size}px`;
            
            // 시작 위치 (셀 내부의 랜덤한 위치)
            const startX = rect.left + Math.random() * rect.width;
            const startY = rect.top + Math.random() * rect.height;
            
            fragment.style.left = `${startX}px`;
            fragment.style.top = `${startY}px`;
            
            // 애니메이션 속도 및 방향 랜덤화
            const speed = 0.5 + Math.random() * 0.5;
            const rotation = Math.random() * 360;
            fragment.style.animation = `fall ${speed}s forwards`;
            fragment.style.transform = `rotate(${rotation}deg)`;
            
            document.body.appendChild(fragment);
            
            // 애니메이션 종료 후 요소 제거
            setTimeout(() => {
                document.body.removeChild(fragment);
            }, speed * 1000);
        }
    },
    
    // 깃발 표시 애니메이션
    placeFlag: function(row, col) {
        const cellElement = UI.getCellElement(row, col);
        if (cellElement) {
            console.log(`깃발 표시 애니메이션: 위치 (${row}, ${col})`);
            cellElement.classList.add('flagged');
            
            // 깃발 표시 효과음 재생 (있는 경우)
            this.playSound('flag');
        } else {
            console.error(`깃발 표시 실패: 셀 요소를 찾을 수 없음 (${row}, ${col})`);
        }
    },
    
    // 깃발 제거 애니메이션
    removeFlag: function(row, col) {
        const cellElement = UI.getCellElement(row, col);
        if (cellElement) {
            console.log(`깃발 제거 애니메이션: 위치 (${row}, ${col})`);
            cellElement.classList.remove('flagged');
            
            // 깃발 제거 효과음 재생 (있는 경우)
            this.playSound('unflag');
        } else {
            console.error(`깃발 제거 실패: 셀 요소를 찾을 수 없음 (${row}, ${col})`);
        }
    },
    
    // 효과음 재생 (있는 경우)
    playSound: function(soundName) {
        // 효과음 요소가 있는 경우에만 실행
        const sound = document.getElementById(`sound-${soundName}`);
        if (sound && sound instanceof HTMLAudioElement) {
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.log(`효과음 재생 실패: ${e.message}`);
            });
        }
    },
    
    // 폭발 애니메이션
    explode: function(row, col) {
        const cellElement = UI.getCellElement(row, col);
        
        // 폭발 효과 생성
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        cellElement.appendChild(explosion);
        
        // 주변 셀에도 약한 폭발 효과 적용
        const { rows, cols } = Game.config[Game.difficulty];
        
        for (let di = -2; di <= 2; di++) {
            for (let dj = -2; dj <= 2; dj++) {
                if (di === 0 && dj === 0) continue;
                
                const ni = row + di;
                const nj = col + dj;
                
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                    const neighborCell = UI.getCellElement(ni, nj);
                    const distance = Math.sqrt(di*di + dj*dj);
                    const delay = distance * 0.1;
                    
                    setTimeout(() => {
                        neighborCell.style.transform = `scale(1.1)`;
                        setTimeout(() => {
                            neighborCell.style.transform = 'scale(1)';
                        }, 200);
                    }, delay * 1000);
                }
            }
        }
        
        // 화면 흔들기 효과
        this.shakeScreen();
    },
    
    // 화면 흔들기 효과
    shakeScreen: function() {
        const gameBoard = UI.gameBoard;
        gameBoard.classList.add('shake');
        
        setTimeout(() => {
            gameBoard.classList.remove('shake');
        }, 500);
    },
    
    // 승리 애니메이션
    win: function() {
        const gameBoard = UI.gameBoard;
        gameBoard.classList.add('win-animation');
        
        setTimeout(() => {
            gameBoard.classList.remove('win-animation');
        }, 1500);
        
        // 축하 효과 (색상 변화)
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
                setTimeout(() => {
                    cell.style.backgroundColor = '';
                }, 300);
            }, index * 10);
        });
    }
};