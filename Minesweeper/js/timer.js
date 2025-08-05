// 타이머 기능을 담당하는 객체
const Timer = {
    // 타이머 변수
    time: 0,
    interval: null,
    maxTime: 999,
    
    // 타이머 초기화
    reset: function() {
        this.time = 0;
        this.stop();
        this.updateDisplay();
    },
    
    // 타이머 시작
    start: function() {
        if (this.interval) return;
        
        const startTime = Date.now() - (this.time * 1000);
        
        this.interval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            this.time = Math.min(elapsedSeconds, this.maxTime);
            this.updateDisplay();
            
            // 999초에 도달하면 타이머 경고 효과
            if (this.time >= this.maxTime - 10) {
                UI.timerDisplay.classList.add('timer-warning');
            }
            
            // 최대 시간 도달 시 타이머 중지
            if (this.time >= this.maxTime) {
                UI.timerDisplay.classList.remove('timer-warning');
                this.stop();
            }
        }, 1000);
    },
    
    // 타이머 중지
    stop: function() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            UI.timerDisplay.classList.remove('timer-warning');
        }
    },
    
    // 타이머 표시 업데이트
    updateDisplay: function() {
        UI.timerDisplay.textContent = this.time.toString().padStart(3, '0');
    },
    
    // 현재 시간 가져오기
    getTime: function() {
        return this.time;
    }
};