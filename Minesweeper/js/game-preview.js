// 게임 미리보기 생성 함수
let previewCreated = false;  // 중복 생성 방지 플래그

function createGamePreview() {
    // 이미 미리보기가 생성된 경우 중복 생성 방지
    if (previewCreated) {
        console.log('게임 미리보기가 이미 생성되어 있습니다.');
        return;
    }
    
    const previewDiv = document.querySelector('.game-preview');
    if (!previewDiv) {
        console.log('게임 미리보기 div를 찾을 수 없습니다.');
        return;
    }
    
    // 기존 내용 확인
    if (previewDiv.children.length > 0) {
        console.log('미리보기 div에 이미 내용이 있습니다.');
        return;
    }
    
    // 이미지 대신 미니 게임판 생성
    const miniBoard = document.createElement('div');
    miniBoard.style.cssText = `
        display: grid;
        grid-template-columns: repeat(9, 1fr);
        grid-template-rows: repeat(9, 1fr);
        gap: 1px;
        width: 250px;
        height: 250px;
        background-color: #999;
        border-radius: 5px;
    `;
    
    // 미니 게임판 셀 생성
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `
            background-color: #ccc;
            border: 1px solid #999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        `;
        
        // 몇 개의 셀에 샘플 콘텐츠 표시
        const rand = Math.random();
        if (rand < 0.3) {
            cell.style.backgroundColor = '#e0e0e0';
            
            if (rand < 0.05) {
                cell.innerHTML = '🚩';
                cell.style.backgroundColor = '#ccc';
            } else if (rand < 0.08) {
                cell.innerHTML = '💣';
                cell.style.backgroundColor = '#ff0000';
            } else {
                const number = Math.floor(Math.random() * 4) + 1;
                cell.textContent = number;
                cell.style.color = ['blue', 'green', 'red', 'purple'][number - 1];
            }
        }
        
        miniBoard.appendChild(cell);
    }
    
    // 기존 내용 제거 후 미니 게임판 추가
    previewDiv.innerHTML = '';
    previewDiv.appendChild(miniBoard);
    
    // 생성 완료 플래그 설정
    previewCreated = true;
    console.log('게임 미리보기 생성 완료');
}

// 페이지 로드 시 미리보기 생성
document.addEventListener('DOMContentLoaded', function() {
    console.log('game-preview.js: DOM 로드 완료');
    
    // 약간의 딜레이 후 생성 (다른 초기화 작업 완료 대기)
    setTimeout(function() {
        createGamePreview();
    }, 100);
});