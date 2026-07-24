/**
 * THEME QUỐC KHÁNH VIỆT NAM - HIỆU ỨNG ĐỘNG
 */

(function initNationalDayTheme() {
    // 1. TẠO NGÔI SAO VÀNG RƠI
    function createFallingStar() {
        const star = document.createElement('div');
        star.classList.add('falling-star');
        
        // Ngôi sao 5 cánh SVG
        star.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#ffff00"/>
            </svg>
        `;
        
        const startPosX = Math.random() * window.innerWidth;
        const duration = Math.random() * 4 + 4; // 4 - 8s
        const scale = Math.random() * 0.7 + 0.3; // 0.3x - 1.0x

        star.style.left = `${startPosX}px`;
        star.style.animationDuration = `${duration}s`;
        star.style.transform = `scale(${scale})`;

        document.body.appendChild(star);

        setTimeout(() => { star.remove(); }, duration * 1000);
    }
    setInterval(createFallingStar, 600);

    // 2. TẠO CẢNH ĐÁM ĐÔNG VẪY CỜ Ở GÓC TRÁI
    const crowdScene = document.createElement('div');
    crowdScene.classList.add('flag-crowd-scene');
    crowdScene.innerHTML = `
        <svg class="crowd-svg" viewBox="0 0 260 300" xmlns="http://www.w3.org/2000/svg">
            <!-- PERSON 1 (left) - body connected to bottom -->
            <g class="person-group">
                <!-- Body/torso (extends to bottom) -->
                <path d="M20,300 L20,210 Q22,195 30,190 L40,188 Q48,190 50,195 Q52,210 50,300 Z" fill="#1a365d"/>
                <!-- Shoulder -->
                <ellipse cx="35" cy="188" rx="18" ry="8" fill="#1e3a5f"/>
                <!-- Neck -->
                <rect x="30" y="178" width="10" height="12" rx="4" fill="#e8b88a"/>
                <!-- Head -->
                <ellipse cx="35" cy="172" rx="12" ry="14" fill="#e8b88a"/>
                <ellipse cx="35" cy="168" rx="11" ry="10" fill="#4a3728"/>
                <!-- Upper arm -->
                <path d="M48,192 Q55,180 58,165 Q60,155 55,150" fill="none" stroke="#1e3a5f" stroke-width="12" stroke-linecap="round"/>
                <!-- Forearm -->
                <path d="M55,150 Q52,135 50,120" fill="none" stroke="#e8b88a" stroke-width="8" stroke-linecap="round"/>
                <!-- Hand/fist -->
                <circle cx="50" cy="118" r="6" fill="#e0a878"/>
                <!-- Flag stick 1 -->
                <rect x="48" y="15" width="3" height="106" rx="1.5" fill="#6B3A1F"/>
                <!-- Flag 1 with wave animation -->
                <g transform="translate(51, 15)" class="flag-wave-1">
                    <path fill="#da251d" stroke="#b91c1c" stroke-width="0.3">
                        <animate attributeName="d" dur="1.8s" repeatCount="indefinite" values="
                            M0,0 Q15,-2 30,-1 Q45,1 60,0 L60,40 Q45,42 30,41 Q15,39 0,40 Z;
                            M0,0 Q15,3 30,1 Q45,-2 60,1 L60,40 Q45,37 30,39 Q15,42 0,40 Z;
                            M0,0 Q15,-2 30,-1 Q45,1 60,0 L60,40 Q45,42 30,41 Q15,39 0,40 Z
                        "/>
                    </path>
                    <polygon fill="#ffff00" points="30,7 33.5,17 42,17.5 35.5,23 37,30 30,26.5 23,30 24.5,23 18,17.5 26.5,17">
                        <animate attributeName="points" dur="1.8s" repeatCount="indefinite" values="
                            30,7 33.5,17 42,17.5 35.5,23 37,30 30,26.5 23,30 24.5,23 18,17.5 26.5,17;
                            31,8 34,17 43,18 36,23.5 38,30.5 31,27 24,31 25,23.5 19,18 27,17.5;
                            30,7 33.5,17 42,17.5 35.5,23 37,30 30,26.5 23,30 24.5,23 18,17.5 26.5,17
                        "/>
                    </polygon>
                </g>
            </g>

            <!-- PERSON 2 (center, taller) - body connected to bottom -->
            <g class="person-group">
                <!-- Body -->
                <path d="M95,300 L95,200 Q98,185 108,180 L120,178 Q130,180 133,185 Q135,200 135,300 Z" fill="#7c2d12"/>
                <!-- Shoulder -->
                <ellipse cx="115" cy="178" rx="22" ry="9" fill="#8b3515"/>
                <!-- Neck -->
                <rect x="109" y="166" width="12" height="14" rx="5" fill="#d4a574"/>
                <!-- Head -->
                <ellipse cx="115" cy="160" rx="14" ry="16" fill="#d4a574"/>
                <ellipse cx="115" cy="155" rx="13" ry="11" fill="#2d1b0e"/>
                <!-- Upper arm -->
                <path d="M133,182 Q142,168 148,150 Q150,140 147,130" fill="none" stroke="#8b3515" stroke-width="14" stroke-linecap="round"/>
                <!-- Forearm -->
                <path d="M147,130 Q144,112 140,95" fill="none" stroke="#d4a574" stroke-width="9" stroke-linecap="round"/>
                <!-- Hand -->
                <circle cx="140" cy="93" r="7" fill="#c4956a"/>
                <!-- Flag stick 2 -->
                <rect x="138" y="5" width="3.5" height="91" rx="1.5" fill="#6B3A1F"/>
                <!-- Flag 2 (bigger) -->
                <g transform="translate(141.5, 5)" class="flag-wave-2">
                    <path fill="#da251d" stroke="#b91c1c" stroke-width="0.3">
                        <animate attributeName="d" dur="1.6s" repeatCount="indefinite" values="
                            M0,0 Q18,3 36,1 Q54,-2 72,0 L72,48 Q54,51 36,49 Q18,46 0,48 Z;
                            M0,0 Q18,-3 36,0 Q54,3 72,1 L72,48 Q54,45 36,47 Q18,50 0,48 Z;
                            M0,0 Q18,3 36,1 Q54,-2 72,0 L72,48 Q54,51 36,49 Q18,46 0,48 Z
                        "/>
                    </path>
                    <polygon fill="#ffff00" points="36,8 40,20 50,20.5 43,27 45,36 36,31.5 27,36 29,27 22,20.5 32,20">
                        <animate attributeName="points" dur="1.6s" repeatCount="indefinite" values="
                            36,8 40,20 50,20.5 43,27 45,36 36,31.5 27,36 29,27 22,20.5 32,20;
                            37,9 41,20.5 51,21 44,27.5 46,36.5 37,32 28,37 30,27.5 23,21 33,20.5;
                            36,8 40,20 50,20.5 43,27 45,36 36,31.5 27,36 29,27 22,20.5 32,20
                        "/>
                    </polygon>
                </g>
            </g>

            <!-- PERSON 3 (right, behind) - body connected to bottom -->
            <g class="person-group">
                <!-- Body -->
                <path d="M170,300 L170,215 Q173,200 180,195 L190,193 Q198,195 200,200 Q202,215 200,300 Z" fill="#374151"/>
                <!-- Shoulder -->
                <ellipse cx="185" cy="193" rx="18" ry="7" fill="#4b5563"/>
                <!-- Neck -->
                <rect x="180" y="183" width="10" height="12" rx="4" fill="#e8b88a"/>
                <!-- Head -->
                <ellipse cx="185" cy="177" rx="12" ry="14" fill="#e8b88a"/>
                <ellipse cx="185" cy="173" rx="11" ry="10" fill="#1a1a2e"/>
                <!-- Upper arm -->
                <path d="M198,197 Q206,183 210,168 Q212,158 208,148" fill="none" stroke="#4b5563" stroke-width="11" stroke-linecap="round"/>
                <!-- Forearm -->
                <path d="M208,148 Q205,133 202,118" fill="none" stroke="#e8b88a" stroke-width="7" stroke-linecap="round"/>
                <!-- Hand -->
                <circle cx="202" cy="116" r="5.5" fill="#e0a878"/>
                <!-- Flag stick 3 -->
                <rect x="200" y="25" width="2.5" height="94" rx="1.2" fill="#6B3A1F"/>
                <!-- Flag 3 -->
                <g transform="translate(202.5, 25)" class="flag-wave-3">
                    <path fill="#da251d" stroke="#b91c1c" stroke-width="0.3">
                        <animate attributeName="d" dur="2s" repeatCount="indefinite" values="
                            M0,0 Q12,-2 24,0 Q36,2 48,0 L48,32 Q36,34 24,33 Q12,31 0,32 Z;
                            M0,0 Q12,2 24,1 Q36,-1 48,1 L48,32 Q36,30 24,31 Q12,33 0,32 Z;
                            M0,0 Q12,-2 24,0 Q36,2 48,0 L48,32 Q36,34 24,33 Q12,31 0,32 Z
                        "/>
                    </path>
                    <polygon fill="#ffff00" points="24,5 27,12 33,12.5 28.5,17 29.5,23 24,20 18.5,23 19.5,17 15,12.5 21,12">
                        <animate attributeName="points" dur="2s" repeatCount="indefinite" values="
                            24,5 27,12 33,12.5 28.5,17 29.5,23 24,20 18.5,23 19.5,17 15,12.5 21,12;
                            25,6 28,12.5 34,13 29,17.5 30,23.5 25,20.5 19.5,24 20,17.5 16,13 22,12.5;
                            24,5 27,12 33,12.5 28.5,17 29.5,23 24,20 18.5,23 19.5,17 15,12.5 21,12
                        "/>
                    </polygon>
                </g>
            </g>
        </svg>
    `;
    document.body.appendChild(crowdScene);

    // OVERRIDE WELCOME BANNER TEXT
    const updateWelcomeText = () => {
        const track = document.querySelector('.welcome-track');
        if (track && track.dataset.theme !== 'national_day') {
            track.dataset.theme = 'national_day';
            const text = "Chúc mừng ngày lễ Tết Độc Lập - Ngày Quốc khánh Việt Nam mùng 2 tháng 9";
            let html = '';
            for (let i = 0; i < 4; i++) {
                html += `<span>${text}</span>`;
                if (i < 3) html += `<span style="display: inline-block; margin: 0 20px; color: #ffff00; font-size: 20px; vertical-align: middle;"><i class="fa-solid fa-star"></i></span>`;
            }
            track.innerHTML = html;
        }
    };
    updateWelcomeText();
    setInterval(updateWelcomeText, 500);

})();
