class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.interval = null;
        this.completedPomodoros = 0;
        
        this.modes = {
            pomodoro: { time: 25 * 60, label: '专注时间' },
            shortBreak: { time: 5 * 60, label: '短休息' },
            longBreak: { time: 15 * 60, label: '长休息' }
        };
        
        this.currentMode = 'pomodoro';
        
        this.timerElement = document.getElementById('timer');
        this.modeLabelElement = document.getElementById('modeLabel');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.completedPomodorosElement = document.getElementById('completedPomodoros');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        
        this.init();
    }
    
    init() {
        this.updateDisplay();
        this.attachEventListeners();
        this.loadStats();
    }
    
    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        this.isRunning = true;
        this.startBtn.textContent = '暂停';
        this.startBtn.classList.add('running');
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.completeTimer();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isRunning = false;
        this.startBtn.textContent = '继续';
        this.startBtn.classList.remove('running');
        
        clearInterval(this.interval);
    }
    
    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.modes[this.currentMode].time;
        this.startBtn.textContent = '开始';
        this.updateDisplay();
    }
    
    completeTimer() {
        this.pauseTimer();
        
        if (this.currentMode === 'pomodoro') {
            this.completedPomodoros++;
            this.completedPomodorosElement.textContent = this.completedPomodoros;
            this.saveStats();
            
            if (this.completedPomodoros % 4 === 0) {
                this.switchMode('longBreak');
            } else {
                this.switchMode('shortBreak');
            }
        } else {
            this.switchMode('pomodoro');
        }
        
        this.playNotificationSound();
        this.showNotification();
    }
    
    switchMode(mode) {
        if (this.isRunning) {
            this.pauseTimer();
        }
        
        this.currentMode = mode;
        this.timeLeft = this.modes[mode].time;
        this.modeLabelElement.textContent = this.modes[mode].label;
        this.startBtn.textContent = '开始';
        
        this.modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timerElement.textContent = timeString;
        document.title = `${timeString} - Pomodoro Timer`;
    }
    
    playNotificationSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.value = 1000;
            oscillator2.type = 'sine';
            gainNode2.gain.value = 0.3;
            
            oscillator2.start();
            oscillator2.stop(audioContext.currentTime + 0.2);
        }, 250);
    }
    
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const message = this.currentMode === 'pomodoro' 
                ? '专注时间完成！休息一下吧。' 
                : '休息时间结束，开始专注吧！';
            
            new Notification('Pomodoro Timer', {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
            });
        }
    }
    
    saveStats() {
        localStorage.setItem('completedPomodoros', this.completedPomodoros);
    }
    
    loadStats() {
        const saved = localStorage.getItem('completedPomodoros');
        if (saved) {
            this.completedPomodoros = parseInt(saved);
            this.completedPomodorosElement.textContent = this.completedPomodoros;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});