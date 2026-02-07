$(document).ready(function() {
    // 1. ตรวจสอบโหมดสี (Auto Load)
    const savedMode = sessionStorage.getItem('userColorMode');
    if (savedMode) {
        setMode(savedMode);
        // ถ้าไม่ใช่หน้า Quiz ให้ปิด Overlay
        if (window.location.pathname.indexOf('quiz.html') === -1) {
            $('#quiz-overlay').hide(); 
        }
    }else {
        // ✨ กรณี "ยังไม่เคยเลือก" (เข้าครั้งแรก): ให้แสดง Popup เลือกสี
        // เช็คว่าถ้าเป็นหน้า Home ให้แสดง Overlay ขึ้นมา
        if (window.location.pathname.indexOf('quiz.html') === -1 || window.location.pathname === '/' || window.location.pathname.endsWith('Home.html')) {
             $('#quiz-overlay').css('display', 'flex').hide().fadeIn();
        }
    }

    // 2. ตรวจสอบแผนที่ (ป้องกัน Error ถ้าไม่มี div แผนที่)
    if (document.getElementById('hospital-map')) {
        initMap();
    }

    // 3. ตรวจสอบผลลัพธ์ Quiz สำหรับหน้า Home
    checkQuizResultOnHome();

    // Fade In Intro หน้า Quiz
    if ($('#step-intro').length) {
        $('#step-intro').fadeIn();
    }
});

// --- DATA CONFIGURATION ---
const dataList = [
    { color: "#6c757d", title: "ระดับปกติ", desc: "สุขภาพใจแข็งแรงดีมาก เหมือนแมวเปอร์เซียที่สง่างาม", advice: "หมั่นสังเกตความรู้สึกตัวเองเสมอ" },
    { color: "#28a745", title: "ระดับเล็กน้อย", desc: "มีความกังวลนิดหน่อย ลองหาเพื่อนคุยหรือทำกิจกรรมที่ชอบ", advice: "หากิจกรรมผ่อนคลาย พักผ่อนให้พอ" },
    { color: "#ffc107", title: "ระดับปานกลาง", desc: "เริ่มเครียดสะสม เหมือนแมวสีสวาดที่ต้องการการดูแล", advice: "ลองปรึกษาเพื่อน หรือหาเวลาพักร้อน" },
    { color: "#fd7e14", title: "ระดับรุนแรง", desc: "เครียดจนกระทบการกินการนอน", advice: "ควรปรึกษาผู้เชี่ยวชาญเพื่อรับคำแนะนำ" },
    { color: "#dc3545", title: "ระดับวิกฤต", desc: "อารมณ์ดิ่งมาก ไม่อยากทำอะไรเลย", advice: "โปรดติดต่อแพทย์หรือสายด่วนทันที" }
];

const questions = [
    "รู้สึกเศร้า หดหู่ หรือท้อใจ?",
    "รู้สึกไม่สนใจหรือไม่เพลิดเพลินกับสิ่งที่เคยชอบ?",
    "นอนหลับยาก หลับๆ ตื่นๆ หรือหลับมากเกินไป?",
    "รู้สึกเหนื่อยง่าย หรือไม่มีแรง?",
    "เบื่ออาหาร หรือกินมากเกินไป?",
    "รู้สึกไม่ดีกับตัวเอง หรือคิดว่าทำให้ครอบครัวผิดหวัง?",
    "มีปัญหาเรื่องสมาธิ เช่น อ่านหนังสือ ดูคลิป หรือทำการบ้านไม่ค่อยรู้เรื่อง?",
    "พูดช้าหรือทำอะไรช้าลง จนคนอื่นสังเกตเห็นได้?",
    "มีความคิดว่าการมีชีวิตอยู่ต่อไปไม่ค่อยมีความหมาย?"
];

let currentQIndex = 0;
let totalScore = 0; 

// ✨ [แก้บัค] ตัวแปรเช็คสถานะการเปลี่ยนหน้า (Lock)
let isTransitioning = false; 


function checkQuizResultOnHome() {
    if (!document.getElementById('result-title')) return;

    // 👇 เปลี่ยนเป็น sessionStorage ให้ตรงกัน
    const savedScore = sessionStorage.getItem('quizScore');
    const savedCatImg = sessionStorage.getItem('quizCatImg');

    if (savedScore !== null) {
        // === กรณี: มีข้อมูล (ทำเสร็จแล้ว) ===
        $('#cat-companion').css('display', 'flex'); 
        if (savedCatImg) {
            $('.cat-avatar').attr('src', savedCatImg);
        }

        let level = 1;
        let score = parseInt(savedScore);
        if (score <= 9) level = 1;
        else if (score <= 13) level = 2;
        else if (score <= 20) level = 3;
        else if (score <= 27) level = 4;
        else level = 5;

        updateUI(level);

    } else {
        // === กรณี: ไม่มีข้อมูล (ยังไม่ทำ) ===
        $('#cat-companion').hide();
        $('#result-title').text("คุณยังไม่ได้ทำแบบทดสอบ");
        $('#result-title').css('color', '#6c757d');
        $('#result-desc').text("ทำแบบทดสอบเพื่อให้เราช่วยวิเคราะห์สุขภาพใจของคุณ");
        $('#result-advice').parent().hide(); 
        $('.mood-item').removeClass('active');
    }
}

// --- COLOR BLIND MODE ---
function setMode(mode) {
    const modes = ['mode-protanopia', 'mode-deuteranopia', 'mode-tritanopia', 'mode-achromatopsia'];
    document.body.classList.remove(...modes);
    if (mode !== 'normal') document.body.classList.add('mode-' + mode);
    // ปิด Dropdown
    if($('.dropdown-toggle').length) $('.dropdown-toggle').dropdown('hide');
}
function selectColor(mode) {
    // 1. ตั้งค่าสี
    setMode(mode);
    
    // 2. บันทึกลงเครื่อง (ครั้งหน้าจะได้ไม่ต้องเลือกอีก)
    sessionStorage.setItem('userColorMode', mode);
    
    // 3. ปิด Popup
    $('#quiz-overlay').fadeOut();
}

function enterSite(mode) {
    setMode(mode);
    sessionStorage.setItem('userColorMode', mode);
    $('#quiz-overlay').fadeOut();
}
//ซ่อนหน้าความรู้
function proceedToQuiz(){
    $('#step-knowledge').fadeOut(300, function(){
        startQuiz()
    });
}
// --- QUIZ LOGIC ---
function startQuiz() {
    $('#quiz-overlay').removeClass('intro-mode');
    $('#step-intro').hide();
    $('#step-quiz').fadeIn();
    
    // 👇👇 สั่งเปลี่ยนพื้นหลังเป็น "รูปตอนตอบคำถาม" 👇👇
    $('body').css('background-image', 'url("BgQ2.jpg")'); 
    
    // รีเซ็ตค่าเริ่มต้น
    currentQIndex = 0;
    totalScore = 0;
    isTransitioning = false;
    
    loadQuestion();
}

function loadQuestion() {
    $('#q-text').text(questions[currentQIndex]);
    $('#q-current').text(currentQIndex + 1);
    $('#q-total').text(questions.length);
    let percent = ((currentQIndex) / questions.length) * 100;
    $('#q-progress').css('width', percent + '%');
}

function answer(score) {
    // ✨ [แก้บัค] ถ้ากำลังเปลี่ยนหน้าอยู่ ให้หยุดทำงานทันที (กันกดเบิ้ล)
    if (isTransitioning) return; 
    
    // ✨ [แก้บัค] ล็อกปุ่มทันทีที่กด
    isTransitioning = true; 

    totalScore += score;
    currentQIndex++;

    if (currentQIndex < questions.length) {
        $('#step-quiz').fadeOut(200, function() {
            loadQuestion();
            $(this).fadeIn(200, function() {
                // ✨ [แก้บัค] ปลดล็อกเมื่ออนิเมชั่นจบ และคำถามใหม่โผล่มาแล้ว
                isTransitioning = false; 
            });
        });
    } else {
        showResult();
        // จบเกมแล้ว ไม่ต้องปลดล็อก isTransitioning ก็ได้ เพราะปุ่มหายไปแล้ว
    }
}

function showResult() {
    $('#step-quiz').hide();
    $('#step-result').fadeIn();
    $('#q-progress').css('width', '100%');

    // 👇👇 สั่งเปลี่ยนพื้นหลังเป็น "รูปตอนจบ" 👇👇
    $('body').css('background-image', 'url("BgQ3.jpg")');

    // ส่วนคำนวณผลลัพธ์ (เหมือนเดิม)
    let catName = "";
    let catDesc = "";
    let catImg = "";

    if (totalScore <= 9) {
        catName = "น้องดอกหญ้า";
        catDesc = "คุณมีจิตใจที่สงบนิ่งและมั่นคง สุขภาพใจแข็งแรงดีมาก เหมือนแมวเปอร์เซียที่สง่างาม";
        catImg = "cat1.png";
    } else if (totalScore <= 13) {
        catName = "น้องพระจันทร์เสี้ยว";
        catDesc = "ช่วงนี้อาจมีความเครียดเล็กน้อย ลองหาเพื่อนคุยหรือทำกิจกรรมที่ชอบ จะกลับมาร่าเริงเหมือนแมววิเชียรมาศจอมซน";
        catImg = "cat2.png";
    } else {
        catName = "น้องแมวสีสวาด";
        catDesc = "ดูเหมือนคุณแบกความรู้สึกหนักอึ้งไว้ การปรึกษาผู้เชี่ยวชาญหรือระบายให้ใครฟัง จะช่วยให้คุณกลับมาเข้มแข็ง";
        catImg = "cat3.png";
    }

    sessionStorage.setItem('quizScore', totalScore);
    sessionStorage.setItem('quizCatImg', catImg);

    $('#result-cat-name').text(catName);
    $('#result-cat-desc').text(catDesc);
    $('#result-cat-img').attr('src', catImg);
}

// --- UI UPDATE (Home Page) ---
function updateUI(val) {
    val = parseInt(val);
    const data = dataList[val - 1];
    
    const items = document.querySelectorAll('.mood-item');
    items.forEach((el, idx) => {
        if(idx + 1 === val) el.classList.add('active');
        else el.classList.remove('active');
    });

    const titleEl = document.getElementById('result-title');
    const descEl = document.getElementById('result-desc');
    const adviceEl = document.getElementById('result-advice');

    if (titleEl && descEl && adviceEl) {
        titleEl.innerText = data.title;
        titleEl.style.color = data.color;
        descEl.innerText = data.desc;
        adviceEl.innerText = data.advice;
        
        $(adviceEl).parent().show(); 

        const box = document.querySelector('.result-box');
        if (box) {
            box.classList.remove('fade-in');
            void box.offsetWidth;
            box.classList.add('fade-in');
        }
    }
}

// --- MAP & LOCATION ---
let map;
function initMap() {
    if (!document.getElementById('hospital-map')) return;

    map = L.map('hospital-map').setView([13.7563, 100.5018], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const hospitals = [
        { name: "รพ. จิตเวช A", lat: 13.7500, lng: 100.5100, detail: "บริการ 24 ชม." },
        { name: "คลินิกหมอใจดี", lat: 13.7600, lng: 100.4900, detail: "เฉพาะทางเครียด ซึมเศร้า" }
    ];

    hospitals.forEach(h => {
        L.marker([h.lat, h.lng])
            .addTo(map)
            .bindPopup(`<b>${h.name}</b><br>${h.detail}`);
    });
}

function getLocation() {
    const status = document.getElementById("location-status");
    if (!status) return;
    status.innerText = "กำลังค้นหา...";

    // 1. สร้างตัวแปรเก็บรูป "หมุดสีแดง" (ใช้รูปจาก Server กลางที่แจกฟรี)
    var redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],      // ขนาดรูป
        iconAnchor: [12, 41],    // จุดที่ชี้ลงบนแผนที่ (ปลายแหลม)
        popupAnchor: [1, -34],   // จุดที่ Popup จะเด้งขึ้นมา
        shadowSize: [41, 41]     // ขนาดเงา
    });

    if (navigator.geolocation) {
        // เพิ่ม Option ให้ค้นหาแม่นยำขึ้น (ตามที่คุยกันรอบที่แล้ว)
        const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if (map) {
                map.flyTo([lat, lng], 15);
                
                // 2. ตรงนี้คือจุดที่เปลี่ยน! ใส่ {icon: redIcon} ลงไป
                L.marker([lat, lng], {icon: redIcon}).addTo(map)
                 .bindPopup("<b>คุณอยู่ที่นี่</b>")
                 .openPopup();
            }
            status.innerText = "พบตำแหน่งแล้ว";
            status.className = "text-success d-block mt-1 small";
        }, () => {
            status.innerText = "ไม่พบพิกัด";
            status.className = "text-danger d-block mt-1 small";
        }, options); // อย่าลืมใส่ options ตรงนี้ด้วย
    } else {
        status.innerText = "Browser ไม่รองรับ";
    }
}
// --- CAT COMPANION ---
const catPhrases = [
    "อย่าลืมดื่มน้ำเยอะๆ นะ!",
    "วันนี้เธอเก่งมากแล้ว พักผ่อนบ้างนะ",
    "มีเรื่องไม่สบายใจ ระบายลงสมุดได้นะ",
    "เราอยู่ตรงนี้เสมอ เมี๊ยว!",
    "ลองหายใจเข้าลึกๆ ดูสิ ช่วยได้นะ",
    "การนอนหลับให้เพียงพอสำคัญมากนะ"
];

function talkCat() {
    const bubble = document.getElementById('cat-speech');
    if (!bubble) return;
    const randomPhrase = catPhrases[Math.floor(Math.random() * catPhrases.length)];
    bubble.innerText = randomPhrase;
    bubble.style.display = 'none';
    setTimeout(() => { bubble.style.display = 'block'; }, 100);
}
function goToKnowledge() {
    // ซ่อน Intro -> แสดง Knowledge
    $('#step-intro').hide();
    $('#step-knowledge').fadeIn();
            
    // ✨ ยังไม่เอา intro-mode ออก เพื่อให้กล่องยังอยู่ซ้ายมือ (ถ้าเป็น Desktop)
    // หรือถ้าอยากให้เด้งมาตรงกลางเลย ให้ลบบรรทัดล่างทิ้ง
    // $('#quiz-overlay').removeClass('intro-mode'); 
}

function backToIntro() {
    $('#step-knowledge').hide();
    $('#step-intro').fadeIn();
}
        
// ฟังก์ชัน startQuiz() ตัวจริงอยู่ใน script.js 
// เมื่อกดปุ่มในหน้า Knowledge มันจะไปเรียก startQuiz() ซึ่งจะจัดการซ่อนหน้านี้และแสดงคำถามให้เอง