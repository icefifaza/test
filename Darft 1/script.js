        function setMode(mode) {
            document.body.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia', 'cb-achromatopsia');
        
            if (mode !== 'normal') {
                document.body.classList.add('cb-' + mode);
            }
        }
        
    const dataList = [
        { color: "#6c757d", title: "ระดับปกติ", desc: "สุขภาพจิตดี ไม่มีเรื่องกังวลใจ", advice: "หมั่นสังเกตความรู้สึกตัวเองเสมอ" },
        { color: "#28a745", title: "ระดับเล็กน้อย", desc: "มีความกังวลนิดหน่อยจากเรื่องทั่วไป", advice: "หากิจกรรมผ่อนคลาย พักผ่อนให้พอ" },
        { color: "#ffc107", title: "ระดับปานกลาง", desc: "เริ่มเครียดสะสม รบกวนจิตใจบ้าง", advice: "ลองปรึกษาเพื่อน หรือหาเวลาพักร้อน" },
        { color: "#fd7e14", title: "ระดับรุนแรง", desc: "เครียดจนกระทบการกินการนอน", advice: "ควรปรึกษาผู้เชี่ยวชาญเพื่อรับคำแนะนำ" },
        { color: "#dc3545", title: "ระดับวิกฤต", desc: "อารมณ์ดิ่งมาก ไม่อยากทำอะไรเลย", advice: "โปรดติดต่อแพทย์หรือสายด่วนทันที" }
    ];

    const slider = document.getElementById('levelSlider');
    const items = document.querySelectorAll('.mood-item');

    function updateUI(val) {
        val = parseInt(val);
        const data = dataList[val - 1];
        
        // Update Thumb Color
        let styleTag = document.getElementById('slider-style');
        if(!styleTag) { styleTag = document.createElement('style'); styleTag.id = 'slider-style'; document.head.appendChild(styleTag); }
        styleTag.innerHTML = `.custom-range-slider::-webkit-slider-thumb { border-color: ${data.color} !important; } 
                              .custom-range-slider::-moz-range-thumb { border-color: ${data.color} !important; }`;

        // Update Icons Active State
        items.forEach((el, idx) => {
            if(idx + 1 === val) el.classList.add('active');
            else el.classList.remove('active');
        });

        // Update Text
        document.getElementById('result-title').innerText = data.title;
        document.getElementById('result-title').style.color = data.color;
        document.getElementById('result-desc').innerText = data.desc;
        document.getElementById('result-advice').innerText = "คำแนะนำ: " + data.advice;

        // Animation Re-trigger
        const anims = document.querySelectorAll('.fade-text');
        anims.forEach(el => { el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'fadeIn 0.4s ease-out'; });
    }

    // Event Listeners
    slider.addEventListener('input', (e) => updateUI(e.target.value));
    window.updateLevel = (val) => { slider.value = val; updateUI(val); };
    
    // Init
    updateUI(1);

    let map;

    function initMap() {
        
        map = L.map('hospital-map').setView([13.6904, 101.0703], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);

        const hospital = [
            {
                name: "แพทย์หญิงนิตยา คลินิก",
                lat: 13.6855,
                lng: 101.0805,
                detail: "คลินิกสุขภาพจิตเฉพาะทาง"
            }
        ];
    

        hospital.forEach(hospital => {
            L.marker([hospital.lat, hospital.lng])
                .addTo(map)
                .bindPopup(`<b>${hospital.name}</b><br>${hospital.detail}`)
    });
}

    function getLocation() {
        const status = document.getElementById("location-status");
        status.innerText = "กำลังค้นหาข้อมูลตำเเหน่งของคุณ...";
    


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude
            const userLng = position.coords.longitude

            map.flyTo([userLat, userLng], 15);
            
            var userIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12,41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            L.marker([userLat, userLng], {icon: userIcon})
            .addTo(map)
            .bindPopup('<b>ตำแหน่งของคุณ</b>')
            .openPopup();

                status.innerText = "พบตำแหน่งปัจจุบันแล้ว";
            }, () => {
                status.innerText = "ไม่สามารถเข้าถึงพิกัดได้ (โปรดเช็คสิทธิ์เข้าถึง)";
            });
        } else {
        status.innerText = "เบราว์เซอร์ไม่รองรับ Geolocation";
    }
}

window.onload = initMap;

        // --- CONFIG: BACKGROUND IMAGES ---
        const bgIntro = "https://placehold.co/800x600/e8f5e9/0A714E?text=Tree+Watercolor+(S__8708108)"; // S__8708108.jpg
        const bgQuiz  = "https://placehold.co/800x600/e3f2fd/0097B2?text=Lake+Watercolor+(S__8708109)"; // S__8708109.jpg
        const bgResult= "https://placehold.co/800x600/f3e5f5/5a7883?text=Hills+Watercolor+(S__8708110)"; // S__8708110.jpg

        // --- QUIZ LOGIC ---
        const questions = [
            "คุณรู้สึกเบื่อหน่าย หรือไม่สนใจทำสิ่งต่างๆ ที่เคยชอบ?",
            "คุณรู้สึกไม่สบายใจ ซึมเศร้า หรือท้อแท้?",
            "คุณหลับยาก หลับๆ ตื่นๆ หรือหลับมากเกินไป?",
            "คุณรู้สึกเหนื่อยง่าย หรือไม่มีแรง?",
            "คุณเบื่ออาหาร หรือกินมากเกินไป?",
            "คุณรู้สึกไม่ดีกับตัวเอง หรือคิดว่าตัวเองล้มเหลว?",
            "คุณมีสมาธิสั้นในการทำสิ่งต่างๆ เช่น ดูทีวี หรืออ่านหนังสือ?",
            "คุณพูดช้า หรือทำอะไรช้าลงจนคนอื่นสังเกตเห็น?",
            "คุณมีความคิดทำร้ายตัวเอง หรือคิดว่าตายไปคงจะดีกว่า?"
        ];
        
        let currentQuestion = 0;
        let score = 0;
        let finalLevel = 1;

        function setQuizBackground(url) {
            const card = document.getElementById('quiz-card');
            card.style.backgroundImage = `url('${url}')`;
        }

        function initQuiz() {
            // Apply Background Image Immediately for Step 1
            setQuizBackground(bgIntro);
        }

        function selectColor(mode) {
            setMode(mode);
            document.getElementById('step-color').style.display = 'none';
            document.getElementById('step-intro').style.display = 'block';
            // Intro uses the same background (Tree)
        }

        function startQuiz() {
            document.getElementById('step-intro').style.display = 'none';
            document.getElementById('step-quiz').style.display = 'block';
            
            // Set Quiz Background
            setQuizBackground(bgQuiz);
            renderQuestion();
        }

        function renderQuestion() {
            document.getElementById('q-current').innerText = currentQuestion + 1;
            document.getElementById('q-progress').style.width = ((currentQuestion + 1) / questions.length * 100) + '%';
            document.getElementById('q-text').innerText = questions[currentQuestion];
        }

        function answer(value) {
            score += value; 
            currentQuestion++;
            
            if (currentQuestion < questions.length) {
                renderQuestion();
            } else {
                showResult();
            }
        }

        function showResult() {
            if(score <= 5) finalLevel = 1;
            else if(score <= 10) finalLevel = 2;
            else if(score <= 15) finalLevel = 3;
            else if(score <= 20) finalLevel = 4;
            else finalLevel = 5;

            document.getElementById('step-quiz').style.display = 'none';
            document.getElementById('step-result').style.display = 'block';
            
            // Set Result Background
            setQuizBackground(bgResult);
            
            const descEl = document.getElementById('result-cat-desc');
            const data = dataList[finalLevel - 1];
            descEl.innerText = `"${data.advice}" - (ระดับ: ${data.title})`;
        }

        function finishQuiz() {
            $('#quiz-overlay').fadeOut();
            const slider = document.getElementById('levelSlider');
            slider.value = finalLevel;
            slider.disabled = true;
            updateUI(finalLevel);
            document.getElementById('cat-companion').style.display = 'flex';
            talkCat();
        }

        const catPhrases = ["อย่าลืมดื่มน้ำเยอะๆ นะ!", "วันนี้เธอเก่งมากแล้ว พักผ่อนบ้างนะ", "มีเรื่องไม่สบายใจ ระบายลงสมุดได้นะ", "เราอยู่ตรงนี้เสมอ เมี๊ยว!", "ลองหายใจเข้าลึกๆ ดูสิ ช่วยได้นะ"];
        function talkCat() {
            const bubble = document.getElementById('cat-speech');
            if (bubble.innerText === "สวัสดี! เราจะอยู่เป็นเพื่อนคุยกับเธอเองนะ สู้ๆ!") {
                 const data = dataList[finalLevel - 1];
                 bubble.innerText = `ผลการประเมินคือ ${data.title} เราจะเป็นกำลังใจให้นะ!`;
            } else {
                bubble.innerText = catPhrases[Math.floor(Math.random() * catPhrases.length)];
            }
            bubble.style.display = 'none';
            setTimeout(() => { bubble.style.display = 'block'; }, 100);
        }