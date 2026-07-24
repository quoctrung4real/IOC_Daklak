/**
 * THEME CÀ PHÊ BUÔN MA THUỘT - HIỆU ỨNG ĐỘNG
 */

(function initCoffeeTheme() {
    // 1. TẠO HẠT CÀ PHÊ RƠI
    function createCoffeeBean() {
        const bean = document.createElement('div');
        bean.classList.add('coffee-bean');
        
        // Hạt cà phê SVG
        bean.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform="rotate(-20 12 12)">
                    <!-- Left half (Darker) -->
                    <path d="M12 1 C7 1, 3 6, 3 12 C3 18, 7 23, 12 23 C17 17, 7 7, 12 1 Z" fill="#4a2e1b"/>
                    <!-- Right half (Lighter) -->
                    <path d="M12 1 C7 7, 17 17, 12 23 C17 23, 21 18, 21 12 C21 6, 17 1, 12 1 Z" fill="#68422a"/>
                    <!-- Crease shadow -->
                    <path d="M12 1 C7 7, 17 17, 12 23" stroke="#1f110a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </g>
            </svg>
        `;
        
        const startPosX = Math.random() * window.innerWidth;
        const duration = Math.random() * 6 + 6; // 6 - 12s
        const scale = Math.random() * 0.8 + 0.6; 

        bean.style.left = `${startPosX}px`;
        bean.style.animationDuration = `${duration}s`;
        bean.style.transform = `scale(${scale})`;

        document.body.appendChild(bean);

        setTimeout(() => { bean.remove(); }, duration * 1000);
    }
    setInterval(createCoffeeBean, 800);

    // 2. CON VOI ĐI NGANG MÀN HÌNH
    const elephant = document.createElement('div');
    elephant.classList.add('coffee-elephant');
    // Simple SVG Elephant silhouette + Coffee Cart
    elephant.innerHTML = `
        <svg width="250" height="140" viewBox="-30 -40 250 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Elephant -->
            <g class="elephant-body">
                <!-- Background Legs -->
                <path class="leg back-leg-1" d="M70 55 L75 84 C 71 84, 71 90, 75 90 L85 90 L80 55 Z" fill="#451a03" style="transform-origin: 75px 55px;"/>
                <path class="leg front-leg-1" d="M30 55 L32 84 C 28 84, 28 90, 32 90 L42 90 L38 55 Z" fill="#451a03" style="transform-origin: 35px 55px;"/>
                
                <!-- Main Body -->
                <path d="M90 50 C95 30, 80 15, 60 15 C40 15, 25 25, 20 40 C15 55, 20 70, 30 75 C40 80, 70 80, 85 75 C95 70, 95 60, 90 50 Z" fill="#78350f"/>
                
                <!-- Head -->
                <path d="M25 35 C10 35, 0 45, 0 60 C0 65, 5 70, 15 70 C25 70, 35 60, 35 50 C35 40, 35 35, 25 35 Z" fill="#78350f"/>
                
                <!-- Trunk -->
                <path class="trunk" d="M 10 60 C -5 70, -10 90, 5 100" stroke="#78350f" stroke-width="12" stroke-linecap="round" fill="none" style="transform-origin: 10px 60px;"/>
                
                <!-- Ear -->
                <path d="M35 30 C20 30, 15 50, 30 65 C40 75, 50 60, 45 40 C42 32, 38 30, 35 30 Z" fill="#451a03"/>
                
                <!-- Eye -->
                <circle cx="15" cy="45" r="3" fill="#fef3c7"/>
                <circle cx="14" cy="45" r="1.5" fill="#1c1917"/>
                
                <!-- Tusk -->
                <path d="M12 65 C5 75, -5 70, -10 60" stroke="#fef3c7" stroke-width="4" stroke-linecap="round" fill="none"/>
                
                <!-- Foreground Legs -->
                <path class="leg back-leg-2" d="M60 55 L65 86 C 61 86, 61 92, 65 92 L75 92 L70 55 Z" fill="#78350f" style="transform-origin: 65px 55px;"/>
                <path class="leg front-leg-2" d="M20 55 L22 86 C 18 86, 18 92, 22 92 L32 92 L28 55 Z" fill="#78350f" style="transform-origin: 25px 55px;"/>
                
                <!-- Tail -->
                <path d="M85 45 C95 55, 100 70, 95 85" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M93 83 L97 90 L92 90 Z" fill="#78350f"/>
            </g>

            <!-- Harness and Rope (drawn over elephant) -->
            <g class="harness-rope">
                <!-- Leather Back Pad -->
                <path d="M50 22 C65 18, 75 22, 85 32 L80 40 C70 30, 55 26, 45 32 Z" fill="#8b4513" stroke="#5c2e0b" stroke-width="1"/>
                
                <!-- Main Harness Straps (Milky White / Off-white) -->
                <!-- Neck/Chest strap -->
                <path d="M28 42 C40 38, 55 35, 60 40" stroke="#f3f4f6" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M28 42 C40 38, 55 35, 60 40" stroke="#d1d5db" stroke-width="1" fill="none"/>
                
                <!-- Girth strap (Belly) -->
                <path d="M60 40 L65 75" stroke="#f3f4f6" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M60 40 L65 75" stroke="#d1d5db" stroke-width="1" fill="none"/>

                <!-- Harness Ring (where straps and rope meet) -->
                <circle cx="63" cy="55" r="4" fill="none" stroke="#9ca3af" stroke-width="2.5"/>

                <!-- Tow Rope (Thick twisted rope effect - Milky White) -->
                <path d="M67 55 C 90 75, 115 82, 135 78" stroke="#f3f4f6" stroke-width="5" fill="none" stroke-linecap="round"/>
                <path d="M67 55 C 90 75, 115 82, 135 78" stroke="#d1d5db" stroke-width="5" fill="none" stroke-dasharray="5,3" stroke-linecap="round"/>
                <!-- Rope core line for realism -->
                <path d="M67 55 C 90 75, 115 82, 135 78" stroke="#9ca3af" stroke-width="1" fill="none" stroke-dasharray="2,6"/>
            </g>

            <!-- Coffee Cart -->
            <g transform="translate(140, 35)">
                <g class="coffee-cart">
                    <!-- Cart Base -->
                    <rect x="-5" y="45" width="60" height="8" rx="3" fill="#8b4513"/>
                    <rect x="-5" y="45" width="60" height="3" rx="1" fill="#a0522d"/>
                    
                    <!-- Wheels -->
                    <circle cx="5" cy="55" r="8" fill="#292524"/>
                    <circle cx="5" cy="55" r="4" fill="#a8a29e"/>
                    <circle cx="45" cy="55" r="8" fill="#292524"/>
                    <circle cx="45" cy="55" r="4" fill="#a8a29e"/>
                    
                    <!-- Traditional Phin Coffee -->
                    <!-- Glass Cup -->
                    <path d="M10 15 L15 42 C15 44, 35 44, 35 42 L40 15 Z" fill="#e5e7eb" fill-opacity="0.5"/>
                    <path d="M10 15 L15 42 C15 44, 35 44, 35 42 L40 15 Z" stroke="#ffffff" stroke-width="1.5" fill="none"/>
                    
                    <!-- Condensed Milk -->
                    <path d="M13.5 32 L15.2 41 C15.5 42.5, 34.5 42.5, 34.8 41 L36.5 32 Z" fill="#fef3c7"/>
                    
                    <!-- Black Coffee -->
                    <path d="M11 20 L13.5 32 L36.5 32 L39 20 Z" fill="#291206"/>
                    <ellipse cx="25" cy="20" rx="14" ry="1.5" fill="#3e1c09"/> <!-- Coffee surface -->

                    <!-- Spoon -->
                    <path d="M35 5 L28 42" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>

                    <!-- Phin Filter Base -->
                    <rect x="5" y="13" width="40" height="2" rx="1" fill="#9ca3af"/>
                    
                    <!-- Phin Body -->
                    <path d="M12 -2 L12 13 L38 13 L38 -2 Z" fill="#e5e7eb"/>
                    <rect x="11" y="-4" width="28" height="2" rx="0.5" fill="#d1d5db"/> <!-- Phin Rim -->
                    
                    <!-- Phin Lid -->
                    <ellipse cx="25" cy="-4" rx="15" ry="2" fill="#9ca3af"/>
                    <ellipse cx="25" cy="-5" rx="14" ry="2" fill="#f3f4f6"/>
                    <path d="M22 -6 L28 -6 L26 -10 L24 -10 Z" fill="#d1d5db"/> <!-- Lid Knob -->

                    <!-- Smoke -->
                    <g class="smoke-group">
                        <path class="smoke smoke-1" d="M25 -10 C20 -20, 35 -30, 25 -40" stroke="#d1d5db" stroke-width="2" fill="none" stroke-linecap="round" opacity="0"/>
                        <path class="smoke smoke-2" d="M15 -5 C5 -15, 20 -25, 15 -35" stroke="#d1d5db" stroke-width="2" fill="none" stroke-linecap="round" opacity="0"/>
                    </g>
                </g>
            </g>
        </svg>
    `;
    document.body.appendChild(elephant);

    // Hàm gọi voi bước ra
    function walkElephant() {
        if (!elephant.classList.contains('walk-in')) {
            elephant.classList.add('walk-in');
            setTimeout(() => {
                elephant.classList.remove('walk-in');
            }, 15500); // Đợi 15.5s cho animation CSS hoàn tất
        }
    }

    // Voi bước ra ngay sau 1s
    setTimeout(walkElephant, 1000);

    // Sau đó lặp lại mỗi 20s
    setInterval(walkElephant, 20000);

    // OVERRIDE WELCOME BANNER TEXT
    const updateWelcomeText = () => {
        const track = document.querySelector('.welcome-track');
        if (track && track.dataset.theme !== 'coffee') {
            track.dataset.theme = 'coffee';
            const text = "Chào mừng ngày Lễ hội cà phê Buôn Ma Thuột - Coffe Festival";
            let html = '';
            for (let i = 0; i < 4; i++) {
                html += `<span>${text}</span>`;
                if (i < 3) html += `<span style="display: inline-block; margin: 0 20px; vertical-align: middle;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g transform="rotate(-20 12 12)">
                            <path d="M12 1 C7 1, 3 6, 3 12 C3 18, 7 23, 12 23 C17 17, 7 7, 12 1 Z" fill="#4a2e1b"/>
                            <path d="M12 1 C7 7, 17 17, 12 23 C17 23, 21 18, 21 12 C21 6, 17 1, 12 1 Z" fill="#68422a"/>
                            <path d="M12 1 C7 7, 17 17, 12 23" stroke="#1f110a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                        </g>
                    </svg>
                </span>`;
            }
            track.innerHTML = html;
        }
    };
    updateWelcomeText();
    setInterval(updateWelcomeText, 500);

})();
