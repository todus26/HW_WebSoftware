// 캘린더 및 투두리스트 초기화
function initCalendar() {
    const calendar = document.getElementById('calendar');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarTitle = document.getElementById('calendar-title');
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    const todoDateTitle = document.getElementById('todo-date-title');
    
    if (!calendar || !prevMonthBtn || !nextMonthBtn || !calendarTitle || 
        !todoInput || !addTodoBtn || !todoList || !todoDateTitle) {
        console.error("캘린더 또는 투두리스트 요소를 찾을 수 없습니다.");
        return;
    }
    
    // 캘린더 그리기
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        calendarTitle.textContent = `${year}년 ${month+1}월`;
        
        // 해당 월의 첫 날과 마지막 날 가져오기
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // 캘린더 테이블 생성
        let calendarHTML = '<table>';
        calendarHTML += '<thead><tr>';
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        days.forEach(day => {
            calendarHTML += `<th>${day}</th>`;
        });
        calendarHTML += '</tr></thead><tbody>';
        
        // 첫 주의 시작 공백
        let date = 1;
        let dayOfWeek = firstDay.getDay();
        
        // 캘린더 내용 생성
        for (let i = 0; i < 6; i++) {
            calendarHTML += '<tr>';
            
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < dayOfWeek) || date > lastDay.getDate()) {
                    calendarHTML += '<td></td>';
                } else {
                    const currentDateStr = `${year}-${month+1}-${date}`;
                    let className = '';
                    
                    // 오늘 날짜 표시
                    const today = new Date();
                    if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                        className += ' today';
                    }
                    
                    // 선택된 날짜 표시
                    if (date === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                        className += ' selected';
                    }
                    
                    // 할 일이 있는 날짜 표시
                    if (todos[currentDateStr] && todos[currentDateStr].length > 0) {
                        className += ' has-todos';
                    }
                    
                    calendarHTML += `<td class="${className}" data-date="${year}-${month+1}-${date}">${date}</td>`;
                    date++;
                }
            }
            
            calendarHTML += '</tr>';
            if (date > lastDay.getDate()) break;
        }
        
        calendarHTML += '</tbody></table>';
        calendar.innerHTML = calendarHTML;
        
        // 날짜 클릭 이벤트 추가
        const dateCells = calendar.querySelectorAll('td[data-date]');
        dateCells.forEach(cell => {
            cell.addEventListener('click', function() {
                const dateStr = this.getAttribute('data-date');
                const dateParts = dateStr.split('-');
                selectedDate = new Date(dateParts[0], dateParts[1]-1, dateParts[2]);
                
                // 이전 선택 해제
                const previousSelected = calendar.querySelector('.selected');
                if (previousSelected) {
                    previousSelected.classList.remove('selected');
                }
                
                // 새 선택 표시
                this.classList.add('selected');
                
                // 투두리스트 업데이트
                updateTodoList();
            });
        });
        
        // 선택된 날짜의 투두리스트 업데이트
        updateTodoList();
    }
    
    // 투두리스트 업데이트
    function updateTodoList() {
        const dateStr = `${selectedDate.getFullYear()}-${selectedDate.getMonth()+1}-${selectedDate.getDate()}`;
        todoDateTitle.textContent = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth()+1}월 ${selectedDate.getDate()}일 할 일 목록`;
        
        todoList.innerHTML = '';
        
        if (!todos[dateStr]) {
            todos[dateStr] = [];
        }
        
        todos[dateStr].forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${escapeHTML(todo.text)}</span>
                <div class="todo-actions">
                    <button class="delete-btn">삭제</button>
                </div>
            `;
            
            // 체크박스 이벤트
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', function() {
                todo.completed = this.checked;
                li.classList.toggle('completed', this.checked);
                saveTodos();
            });
            
            // 삭제 버튼 이벤트
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function() {
                todos[dateStr].splice(index, 1);
                updateTodoList();
                saveTodos();
            });
            
            todoList.appendChild(li);
        });
    }
    
    // 할 일 추가
    function addTodo() {
        const text = todoInput.value.trim();
        if (!text) return;
        
        const dateStr = `${selectedDate.getFullYear()}-${selectedDate.getMonth()+1}-${selectedDate.getDate()}`;
        
        if (!todos[dateStr]) {
            todos[dateStr] = [];
        }
        
        todos[dateStr].push({
            text: text,
            completed: false,
            date: dateStr
        });
        
        todoInput.value = '';
        updateTodoList();
        saveTodos();
        renderCalendar(); // 달력에 표시 업데이트
    }
    
    // 할 일 저장
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // 이벤트 리스너 추가
    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    addTodoBtn.addEventListener('click', addTodo);
    
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // 초기 렌더링
    renderCalendar();
}// DOM 요소 가져오기
const searchIntro = document.getElementById('search-intro');
const mainContent = document.getElementById('main-content');
const nameSearch = document.getElementById('name-search');
const searchBtn = document.getElementById('search-btn');

// 전역 변수
let currentDate = new Date();
let selectedDate = new Date();
let todos = {};

// 초기화 함수
function init() {
    try {
        // localStorage에서 할일 데이터 가져오기
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) {
            todos = JSON.parse(storedTodos);
        }
    } catch (error) {
        console.error("로컬 스토리지 데이터 로드 중 오류:", error);
        todos = {};
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    init();
    searchIntro.classList.add('fade-in');
    nameSearch.focus();
    
    // 페이지 해시가 있으면 메인 콘텐츠 표시
    if (window.location.hash === '#profile') {
        searchIntro.classList.add('hidden');
        mainContent.classList.remove('hidden');
        
        // 방명록과 캘린더 초기화
        setTimeout(function() {
            try {
                initGuestbook();
                initCalendar();
            } catch (error) {
                console.error("기능 초기화 중 오류:", error);
            }
        }, 500);
    }
});

// 검색 버튼 클릭 이벤트
searchBtn.addEventListener('click', handleSearch);

// 엔터 키 이벤트
nameSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// 검색 처리 함수
function handleSearch() {
    const searchValue = nameSearch.value.trim().toLowerCase();
    const targetName = '정새연';
    
    if (searchValue === '' || searchValue === '정새연' || searchValue === 'jungsaejeon') {
        // 검색창 페이드 아웃 효과
        searchIntro.style.opacity = '0';
        searchIntro.style.transition = 'opacity 0.5s ease';
        
        // 0.5초 후 메인 콘텐츠 표시
        setTimeout(() => {
            searchIntro.classList.add('hidden');
            mainContent.classList.remove('hidden');
            mainContent.classList.add('fade-in');
            
            // URL 해시 변경 (북마크 가능)
            window.location.hash = 'profile';
            
            // 타이핑 효과 시작 (메인 콘텐츠 표시 후)
            const welcomeMessage = document.querySelector('#content-area h2');
            if (welcomeMessage) {
                const text = welcomeMessage.textContent;
                welcomeMessage.textContent = '';
                typeEffect(welcomeMessage, text, 0);
            }
            
            // 방명록과 캘린더 초기화
            setTimeout(() => {
                initGuestbook();
                initCalendar();
            }, 500);
        }, 500);
    } else {
        // 일치하지 않는 경우 입력란 흔들림 효과
        nameSearch.classList.add('shake');
        nameSearch.style.borderColor = 'red';
        
        setTimeout(() => {
            nameSearch.classList.remove('shake');
            nameSearch.style.borderColor = '';
        }, 500);
        
        // 경고 메시지 (선택 사항)
        alert('이름을 올바르게 입력하세요. (힌트: 정새연)');
    }
}

// 타이핑 효과 함수
function typeEffect(element, text, index) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        setTimeout(() => typeEffect(element, text, index + 1), 50);
    }
}

// URL 해시가 있는 경우 페이지 새로고침 시 바로 메인 콘텐츠 표시
if (window.location.hash === '#profile') {
    searchIntro.classList.add('hidden');
    mainContent.classList.remove('hidden');
    
    // 유튜브 영상 자동 재생 (페이지 새로고침 시)
    setTimeout(() => {
        playYoutubeVideo('youtube-player');
    }, 1000);
}

// 유튜브 API 로드
function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// 유튜브 영상 재생 함수
function playYoutubeVideo(playerId) {
    const iframe = document.getElementById(playerId);
    if (iframe) {
        // 기존 src에 autoplay=1 파라미터 추가
        let src = iframe.src;
        if (src.indexOf('autoplay=1') === -1) {
            iframe.src = src + (src.indexOf('?') !== -1 ? '&' : '?') + 'autoplay=1';
        }
    }
}

// 페이지 로드 시 유튜브 API 로드
loadYouTubeAPI();

// 방명록 초기화 및 관련 함수
function initGuestbook() {
    console.log("방명록 초기화 시작");
    
    try {
        const guestbookForm = document.getElementById('guestbook-form');
        const guestbookEntries = document.getElementById('guestbook-entries');
        
        if (!guestbookForm || !guestbookEntries) {
            console.error("방명록 요소를 찾을 수 없습니다");
            return;
        }
        
        // 기존 이벤트 리스너 제거 (중복 방지)
        const newGuestbookForm = guestbookForm.cloneNode(true);
        guestbookForm.parentNode.replaceChild(newGuestbookForm, guestbookForm);
        
        // 새 이벤트 리스너 등록
        newGuestbookForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            try {
                const nameInput = document.getElementById('guest-name');
                const messageInput = document.getElementById('guest-message');
                
                if (!nameInput || !messageInput) {
                    throw new Error("방명록 입력 필드를 찾을 수 없습니다");
                }
                
                const name = nameInput.value.trim();
                const message = messageInput.value.trim();
                
                if (!name || !message) {
                    alert("닉네임과 내용을 모두 입력해주세요.");
                    return;
                }
                
                const newEntry = {
                    id: Date.now(),  // 고유 ID 추가
                    name: name,
                    message: message,
                    date: new Date().toLocaleString()
                };
                
                // 로컬 스토리지에서 기존 데이터 가져오기
                let entries = [];
                try {
                    const storedEntries = localStorage.getItem('guestbookEntries');
                    entries = storedEntries ? JSON.parse(storedEntries) : [];
                    if (!Array.isArray(entries)) entries = [];
                } catch (error) {
                    console.error("저장된 방명록 데이터 파싱 오류:", error);
                    entries = [];
                }
                
                // 새 항목 추가 및 저장
                entries.unshift(newEntry);
                localStorage.setItem('guestbookEntries', JSON.stringify(entries));
                
                // UI 업데이트
                displayGuestbookEntries();
                
                // 폼 초기화
                nameInput.value = '';
                messageInput.value = '';
                
                console.log("새 방명록 등록 완료");
            } catch (error) {
                console.error("방명록 등록 중 오류 발생:", error);
                alert("방명록 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        });
        
        // 초기 방명록 표시
        displayGuestbookEntries();
        console.log("방명록 초기화 완료");
    } catch (error) {
        console.error("방명록 초기화 중 오류 발생:", error);
    }
}

// 방명록 항목 표시
function displayGuestbookEntries() {
    try {
        const guestbookEntries = document.getElementById('guestbook-entries');
        if (!guestbookEntries) {
            throw new Error("guestbook-entries 요소를 찾을 수 없습니다");
        }
        
        // 로컬 스토리지에서 데이터 가져오기
        let entries = [];
        try {
            const storedEntries = localStorage.getItem('guestbookEntries');
            entries = storedEntries ? JSON.parse(storedEntries) : [];
            if (!Array.isArray(entries)) entries = [];
        } catch (error) {
            console.error("저장된 방명록 데이터 파싱 오류:", error);
            entries = [];
        }
        
        // 방명록 목록 초기화
        guestbookEntries.innerHTML = '';
        
        if (entries.length === 0) {
            guestbookEntries.innerHTML = '<p class="no-entries">아직 방명록이 없습니다. 첫 번째 메시지를 남겨보세요!</p>';
            return;
        }
        
        // 각 항목 표시
        entries.forEach(function(entry) {
            if (!entry || !entry.name || !entry.message) return;
            
            const entryElement = document.createElement('div');
            entryElement.className = 'guestbook-entry';
            
            try {
                entryElement.innerHTML = `
                    <div class="guestbook-entry-header">
                        <span class="guestbook-entry-name">${escapeHTML(entry.name)}</span>
                        <span class="guestbook-entry-date">${entry.date || '날짜 없음'}</span>
                    </div>
                    <div class="guestbook-entry-message">${escapeHTML(entry.message)}</div>
                `;
                
                guestbookEntries.appendChild(entryElement);
            } catch (error) {
                console.error("방명록 항목 렌더링 오류:", error);
            }
        });
        
        console.log("방명록 표시 완료 - 항목 수:", entries.length);
    } catch (error) {
        console.error("방명록 표시 중 오류 발생:", error);
    }
}

// HTML 이스케이프 함수 (XSS 방지)
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 타이핑 효과 함수
function typeEffect(element, text, index) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        setTimeout(() => typeEffect(element, text, index + 1), 50);
    }
}

// HTML 이스케이프 함수 (XSS 방지)
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 추가적인 애니메이션과 상호작용을 위한 CSS 스타일 추가
const style = document.createElement('style');
style.textContent = `
    .shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
`;
document.head.appendChild(style);