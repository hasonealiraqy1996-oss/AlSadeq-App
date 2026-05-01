const COMPANY_LAT = 33.306140; 
const COMPANY_LNG = 44.514822; 
const ALLOWED_RADIUS = 500;
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyvZlD5EgwDCqR_MhUkl5XwK-LzUG9WK9u8tD-rQbgelxrYYsCk1LMX4cHuVI0rbai6/exec";

const urlParams = new URLSearchParams(window.location.search);
const deviceId = urlParams.get('id') || "UNKNOWN";

function updateClock() {
    const dEl = document.getElementById('cur-date');
    const tEl = document.getElementById('cur-time');
    if (dEl && tEl) {
        const now = new Date();
        dEl.innerText = now.toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        tEl.innerText = now.toLocaleTimeString('en-GB');
    }
}
setInterval(updateClock, 1000);

window.onload = function() {
    fetch(`${WEB_APP_URL}?id=${encodeURIComponent(deviceId)}`)
        .then(r => r.json())
        .then(status => {
            const empElement = document.getElementById('emp-name');
            const pId = document.getElementById('p-id');
            if (status.registered) {
                empElement.innerText = status.name;
                pId.innerText = deviceId;
            } else {
                empElement.innerText = "جهاز غير معرف";
            }
        });
    document.getElementById('btnIn').onclick = () => processAction('IN');
    document.getElementById('btnOut').onclick = () => processAction('OUT');
};

function startSystem() {
    const splash = document.getElementById('splash-screen');
    const main = document.getElementById('main-content');
    splash.style.opacity = '0';
    splash.style.transform = 'translateY(-100%)';
    setTimeout(() => {
        splash.style.display = 'none';
        main.style.display = 'flex';
        setTimeout(() => main.style.opacity = '1', 50);
    }, 1000);
}

function checkLocationAndEnter() {
    Swal.fire({ title: 'جاري فحص النطاق الأمني', html: 'يتم التحقق من موقعك...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const d = calculateDistance(pos.coords.latitude, pos.coords.longitude, COMPANY_LAT, COMPANY_LNG);
            if (d <= ALLOWED_RADIUS) { Swal.close(); startSystem(); }
            else { Swal.fire({ icon: 'error', title: 'دخول مرفوض', text: `بعيد عن الشركة بمقدار ${(d/1000).toFixed(2)} كم.` }); }
        }, () => Swal.fire({ icon: 'warning', title: 'خدمة الموقع معطلة', text: 'يرجى تفعيل الـ GPS.' }));
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function processAction(type) {
    const name = document.getElementById('emp-name').innerText;
    if(name.includes("جاري") || name.includes("غير معرف")) return Swal.fire('تنبيه', 'يرجى الانتظار أو التأكد من معرف الجهاز', 'warning');
    
    fetch(`${WEB_APP_URL}?action=record&name=${encodeURIComponent(name)}&type=${type}&id=${encodeURIComponent(deviceId)}`)
        .then(r => r.text())
        .then(res => {
            Swal.fire({ icon: res.includes("✅") ? 'success' : 'info', title: 'العملية', text: res.replace(/[✅⚠️❌]/g, '') });
        });
}
