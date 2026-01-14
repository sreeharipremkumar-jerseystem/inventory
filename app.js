// ========== CONFIG ==========
const SHARED_PASSWORD = 'jerseystem2025';

// ========== PARTS BY CATEGORY ==========
const CATEGORIES = [
    {
        name: 'Electronics',
        icon: '⚡',
        parts: [
            { id: 'large_hub', name: 'Large Hub', expected: 1 },
            { id: 'hub_battery', name: 'Hub Battery', expected: 1 },
            { id: 'medium_motor', name: 'Medium Motor', expected: 2 },
            { id: 'large_motor', name: 'Large Motor', expected: 1 },
            { id: 'color_sensor', name: 'Color Sensor', expected: 1 },
            { id: 'distance_sensor', name: 'Distance Sensor', expected: 1 },
            { id: 'force_sensor', name: 'Force Sensor', expected: 1 },
            { id: 'micro_usb', name: 'USB Cable', expected: 1 }
        ]
    },
    {
        name: 'Beams & Frames',
        icon: '🔧',
        parts: [
            { id: 'beam_3m', name: 'Beam 3m', expected: 6 },
            { id: 'beam_5m', name: 'Beam 5m', expected: 4 },
            { id: 'beam_7m', name: 'Beam 7m', expected: 6 },
            { id: 'beam_9m', name: 'Beam 9m', expected: 4 },
            { id: 'beam_11m', name: 'Beam 11m', expected: 4 },
            { id: 'beam_13m', name: 'Beam 13m', expected: 4 },
            { id: 'beam_15m', name: 'Beam 15m', expected: 6 },
            { id: 'frame_5x7', name: 'Frame 5x7', expected: 2 },
            { id: 'frame_7x11', name: 'Frame 7x11', expected: 2 },
            { id: 'frame_11x15', name: 'Frame 11x15', expected: 1 }
        ]
    },
    {
        name: 'Angular Beams',
        icon: '📐',
        parts: [
            { id: 'angular_4x4', name: 'Angular 4x4', expected: 4 },
            { id: 'angular_3x7_45', name: 'Angular 3x7 (45°)', expected: 4 },
            { id: 'angular_2x4_90', name: 'Angular 2x4 (90°)', expected: 4 },
            { id: 'angular_3x7', name: 'Angular 3x7', expected: 2 },
            { id: 'angular_3x5_90', name: 'Angular 3x5 (90°)', expected: 4 }
        ]
    },
    {
        name: 'Axles',
        icon: '➖',
        parts: [
            { id: 'axle_2m_snap', name: 'Axle 2m w/Snap', expected: 10 },
            { id: 'axle_2m_groove', name: 'Axle 2m w/Groove', expected: 8 },
            { id: 'axle_3m', name: 'Axle 3m', expected: 8 },
            { id: 'axle_4m', name: 'Axle 4m', expected: 4 },
            { id: 'axle_5m', name: 'Axle 5m', expected: 4 },
            { id: 'axle_7m', name: 'Axle 7m', expected: 4 },
            { id: 'axle_8m', name: 'Axle 8m', expected: 4 },
            { id: 'axle_9m', name: 'Axle 9m', expected: 4 },
            { id: 'axle_11m', name: 'Axle 11m', expected: 2 }
        ]
    },
    {
        name: 'Connectors & Pegs',
        icon: '🔩',
        parts: [
            { id: 'peg_black', name: 'Peg Black (Friction)', expected: 72 },
            { id: 'peg_friction_3m', name: 'Peg Friction 3m', expected: 10 },
            { id: 'peg_blue', name: 'Peg Blue', expected: 20 },
            { id: 'friction_snap', name: 'Friction Snap 2m', expected: 10 },
            { id: 'bush', name: 'Bush', expected: 10 },
            { id: 'double_cross', name: 'Double Cross Block', expected: 4 }
        ]
    },
    {
        name: 'Wheels & Gears',
        icon: '⚙️',
        parts: [
            { id: 'wheel_56', name: 'Large Wheel (Ø56mm)', expected: 4 },
            { id: 'tyre_narrow', name: 'Tyre Narrow', expected: 2 },
            { id: 'wedge_wheel', name: 'Wedge-Belt Wheel', expected: 2 },
            { id: 'gear_z12', name: 'Gear z12', expected: 2 },
            { id: 'gear_z20', name: 'Gear z20', expected: 2 },
            { id: 'gear_z36', name: 'Gear z36', expected: 2 },
            { id: 'gear_z28', name: 'Angled Gear z28', expected: 2 }
        ]
    },
    {
        name: 'Panels & Plates',
        icon: '🟦',
        parts: [
            { id: 'panel_11x19', name: 'Panel 11x19', expected: 2 },
            { id: 'panel_3x11', name: 'Panel 3x11', expected: 2 },
            { id: 'plate_2x16', name: 'Plate 2x16', expected: 2 },
            { id: 'plate_2x8', name: 'Plate 2x8', expected: 4 }
        ]
    },
    {
        name: 'Decorative & Misc',
        icon: '🎨',
        parts: [
            { id: 'minifig_kate', name: 'Kate Minifigure', expected: 1 },
            { id: 'minifig_kyle', name: 'Kyle Minifigure', expected: 1 },
            { id: 'rubber_band', name: 'Rubber Band', expected: 2 },
            { id: 'storage_box', name: 'Storage Box', expected: 1 },
            { id: 'sorting_trays', name: 'Sorting Trays', expected: 2 }
        ]
    }
];

// Flatten parts for easy lookup
const PARTS = CATEGORIES.flatMap(c => c.parts);

// ========== STATE ==========
let currentUser = null;
let schools = [];
let currentSchool = null;
let currentKit = null;
let inventoryData = {};
let pendingChanges = {};
let hasUnsavedChanges = false;
let currentFilter = 'all';
let currentSemester = 'start';
let editingSchoolId = null;
let editingKitId = null;

// ========== STORAGE ==========
function loadData() {
    schools = JSON.parse(localStorage.getItem('js_schools') || '[]');
    inventoryData = JSON.parse(localStorage.getItem('js_inventory') || '{}');
}
function saveData() {
    localStorage.setItem('js_schools', JSON.stringify(schools));
    localStorage.setItem('js_inventory', JSON.stringify(inventoryData));
}

// ========== AUTH ==========
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email-input').value.trim().toLowerCase();
    const pw = document.getElementById('password-input').value;
    document.getElementById('email-error').classList.remove('show');
    document.getElementById('password-error').classList.remove('show');
    if (!email.endsWith('@mystemclub.org')) {
        document.getElementById('email-error').classList.add('show'); return;
    }
    if (pw !== SHARED_PASSWORD) {
        document.getElementById('password-error').classList.add('show'); return;
    }
    currentUser = email.split('@')[0];
    localStorage.setItem('js_user', currentUser);
    showScreen('school-screen');
}
function logout() {
    if (hasUnsavedChanges && !confirm('Unsaved changes will be lost. Continue?')) return;
    currentUser = null;
    localStorage.removeItem('js_user');
    showScreen('login-screen');
}

// ========== NAVIGATION ==========
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'school-screen') renderSchools();
    else if (id === 'kit-screen') { currentFilter = 'all'; renderKits(); }
    else if (id === 'inventory-screen') renderInventory();
}
function goBack() {
    if (hasUnsavedChanges && !confirm('Unsaved changes will be lost. Continue?')) return;
    hasUnsavedChanges = false;
    pendingChanges = {};
    showScreen('kit-screen');
}

// ========== SCHOOLS ==========
function renderSchools() {
    const list = document.getElementById('school-list');
    const empty = document.getElementById('school-empty');
    if (schools.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    list.innerHTML = schools.map(s => {
        const stats = getSchoolStats(s);
        let statusClass = 'complete', statusText = 'All Complete';
        if (stats.issues > 0) { statusClass = 'issues'; statusText = `${stats.issues} Issues`; }
        else if (stats.pending > 0) { statusClass = 'pending'; statusText = `${stats.pending} Pending`; }
        return `
            <div class="school-card" onclick="selectSchool('${s.id}')">
                <div class="school-info">
                    <h3>${s.name}</h3>
                    <div class="school-meta">
                        <span class="status-dot ${statusClass}"></span>
                        <span>${s.kits?.length || 0} Kits - ${statusText}</span>
                    </div>
                </div>
                <span class="chevron">›</span>
            </div>
        `;
    }).join('');
}
function getSchoolStats(school) {
    let pending = 0, issues = 0, complete = 0;
    (school.kits || []).forEach(k => {
        const st = getKitStatus(school.id, k.id);
        if (st === 'pending') pending++;
        else if (st === 'issues') issues++;
        else complete++;
    });
    return { pending, issues, complete };
}
function filterSchools() {
    const q = document.getElementById('school-search').value.toLowerCase();
    document.querySelectorAll('.school-card').forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = name.includes(q) ? 'flex' : 'none';
    });
}
function selectSchool(id) {
    currentSchool = schools.find(s => s.id === id);
    document.getElementById('nav-school-name').textContent = currentSchool.name;
    document.getElementById('nav-school-name2').textContent = currentSchool.name;
    showScreen('kit-screen');
}
function addSchool() {
    const name = document.getElementById('new-school-name').value.trim();
    if (!name) return alert('Enter school name');
    schools.push({ id: 'school_' + Date.now(), name, kits: [] });
    saveData();
    closeModal('add-school-modal');
    document.getElementById('new-school-name').value = '';
    renderSchools();
}
function openEditSchool(id, e) {
    e?.stopPropagation();
    editingSchoolId = id;
    document.getElementById('edit-school-name').value = schools.find(s => s.id === id).name;
    openModal('edit-school-modal');
}
function saveSchoolEdit() {
    const name = document.getElementById('edit-school-name').value.trim();
    if (!name) return;
    schools.find(s => s.id === editingSchoolId).name = name;
    saveData();
    closeModal('edit-school-modal');
    renderSchools();
}
function deleteSchool() {
    if (!confirm('Delete school and all kits?')) return;
    schools = schools.filter(s => s.id !== editingSchoolId);
    Object.keys(inventoryData).forEach(k => { if (k.startsWith(editingSchoolId)) delete inventoryData[k]; });
    saveData();
    closeModal('edit-school-modal');
    renderSchools();
}

// ========== KITS ==========
function renderKits() {
    const grid = document.getElementById('kit-grid');
    const empty = document.getElementById('kit-empty');
    const kits = currentSchool.kits || [];
    
    // Count stats
    let pending = 0, issues = 0;
    kits.forEach(k => {
        const st = getKitStatus(currentSchool.id, k.id);
        if (st === 'pending') pending++;
        else if (st === 'issues') issues++;
    });
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('issues-count').textContent = issues;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    });
    
    // Filter kits
    const filtered = kits.filter(k => {
        if (currentFilter === 'all') return true;
        return getKitStatus(currentSchool.id, k.id) === currentFilter;
    });
    
    if (kits.length === 0) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No ${currentFilter} kits</div>`;
        return;
    }
    
    grid.innerHTML = filtered.map((k, i) => {
        const idx = kits.indexOf(k) + 1;
        const status = getKitStatus(currentSchool.id, k.id);
        const missing = getMissingCount(currentSchool.id, k.id);
        let statusHtml = '';
        if (status === 'complete') statusHtml = `<div class="kit-status complete">● Complete</div>`;
        else if (status === 'issues') statusHtml = `<div class="kit-status issues">● Missing ${missing} Items</div>`;
        else statusHtml = `<div class="kit-status pending">● Pending</div>`;
        return `
            <div class="kit-card" onclick="selectKit('${k.id}')">
                <div class="kit-header">
                    <span class="kit-name">${k.name || 'Kit ' + idx}</span>
                    <button class="kit-menu" onclick="event.stopPropagation();openEditKit('${k.id}')">•••</button>
                </div>
                ${statusHtml}
            </div>
        `;
    }).join('');
}
function getKitStatus(schoolId, kitId) {
    let hasStart = false, hasEnd = false, hasIssue = false;
    PARTS.forEach(p => {
        const d = inventoryData[`${schoolId}_${kitId}_${p.id}`];
        if (d) {
            if (d.start !== undefined && d.start !== '') hasStart = true;
            if (d.end !== undefined && d.end !== '') {
                hasEnd = true;
                const startVal = d.start !== '' && d.start !== undefined ? parseInt(d.start) : p.expected;
                if (parseInt(d.end) < startVal) hasIssue = true;
            }
        }
    });
    if (hasIssue) return 'issues';
    if (hasEnd) return 'complete';
    return 'pending';
}
function getMissingCount(schoolId, kitId) {
    let missing = 0;
    PARTS.forEach(p => {
        const d = inventoryData[`${schoolId}_${kitId}_${p.id}`];
        if (d && d.end !== undefined && d.end !== '') {
            const startVal = d.start !== '' && d.start !== undefined ? parseInt(d.start) : p.expected;
            if (parseInt(d.end) < startVal) missing += (startVal - parseInt(d.end));
        }
    });
    return missing;
}
function setFilter(f) { currentFilter = f; renderKits(); }
function selectKit(id) {
    currentKit = currentSchool.kits.find(k => k.id === id);
    const idx = currentSchool.kits.indexOf(currentKit) + 1;
    document.getElementById('nav-kit-name').textContent = currentKit.name || 'Kit ' + idx;
    document.getElementById('inventory-title').textContent = (currentKit.name || 'Kit ' + idx) + ' Inventory';
    hasUnsavedChanges = false;
    pendingChanges = {};
    currentSemester = 'start';
    showScreen('inventory-screen');
}
function addKit() {
    const name = document.getElementById('new-kit-name').value.trim();
    if (!currentSchool.kits) currentSchool.kits = [];
    currentSchool.kits.push({ id: 'kit_' + Date.now(), name });
    saveData();
    closeModal('add-kit-modal');
    document.getElementById('new-kit-name').value = '';
    renderKits();
}
function openEditKit(id) {
    editingKitId = id;
    const kit = currentSchool.kits.find(k => k.id === id);
    document.getElementById('edit-kit-name').value = kit.name || '';
    openModal('edit-kit-modal');
}
function saveKitEdit() {
    const name = document.getElementById('edit-kit-name').value.trim();
    currentSchool.kits.find(k => k.id === editingKitId).name = name;
    saveData();
    closeModal('edit-kit-modal');
    renderKits();
}
function deleteKit() {
    if (!confirm('Delete this kit?')) return;
    currentSchool.kits = currentSchool.kits.filter(k => k.id !== editingKitId);
    Object.keys(inventoryData).forEach(key => { if (key.includes(editingKitId)) delete inventoryData[key]; });
    saveData();
    closeModal('edit-kit-modal');
    renderKits();
}

// ========== INVENTORY ==========
function setSemester(sem) {
    currentSemester = sem;
    document.querySelectorAll('.semester-tab').forEach(t => t.classList.toggle('active', t.dataset.sem === sem));
    renderInventory();
}
function renderInventory() {
    updateSaveStatus();
    const container = document.getElementById('categories');
    container.innerHTML = CATEGORIES.map(cat => `
        <div class="category" data-cat="${cat.name}">
            <div class="category-header" onclick="toggleCategory(this)">
                <span class="category-name">${cat.icon} ${cat.name}</span>
                <span class="category-chevron">▼</span>
            </div>
            <div class="category-items">
                ${cat.parts.map(p => renderPartRow(p)).join('')}
            </div>
        </div>
    `).join('');
}
function renderPartRow(part) {
    const key = `${currentSchool.id}_${currentKit.id}_${part.id}`;
    const data = inventoryData[key] || {};
    const pending = pendingChanges[key] || {};
    const val = pending[currentSemester] !== undefined ? pending[currentSemester] : (data[currentSemester] ?? '');
    const numVal = val === '' ? '' : parseInt(val);
    const isOk = numVal !== '' && numVal >= part.expected;
    const isMissing = numVal !== '' && numVal < part.expected;
    
    let badge = '';
    if (isOk) badge = `<span class="ok-badge">OK</span>`;
    else if (isMissing) badge = `<span class="missing-badge">-${part.expected - numVal}</span>`;
    
    return `
        <div class="part-row" data-part="${part.id}">
            <div class="part-info">
                <div class="part-icon">${CATEGORIES.find(c=>c.parts.includes(part))?.icon || '📦'}</div>
                <span class="part-name">${part.name}</span>
            </div>
            <div class="part-controls">
                <button class="counter-btn" onclick="adjust('${part.id}',-1)" ${numVal === '' || numVal <= 0 ? 'disabled' : ''}>−</button>
                <input type="text" class="counter-value" value="${val === '' ? '' : numVal}" data-part="${part.id}" onchange="handleInput(this)" onfocus="this.select()" inputmode="numeric">
                <span class="part-expected">/${part.expected}</span>
                <button class="counter-btn" onclick="adjust('${part.id}',1)" ${numVal >= part.expected ? 'disabled' : ''}>+</button>
                ${badge}
            </div>
        </div>
    `;
}
function toggleCategory(header) {
    header.parentElement.classList.toggle('collapsed');
}
function adjust(partId, delta) {
    const key = `${currentSchool.id}_${currentKit.id}_${partId}`;
    const part = PARTS.find(p => p.id === partId);
    const data = inventoryData[key] || {};
    const pending = pendingChanges[key] || {};
    let val = pending[currentSemester] !== undefined ? pending[currentSemester] : (data[currentSemester] ?? '');
    val = val === '' ? part.expected : parseInt(val);
    val = Math.max(0, Math.min(val + delta, part.expected));
    if (!pendingChanges[key]) pendingChanges[key] = {};
    pendingChanges[key][currentSemester] = val;
    hasUnsavedChanges = true;
    updateSaveStatus();
    // Re-render just this row
    const row = document.querySelector(`[data-part="${partId}"]`);
    if (row) row.outerHTML = renderPartRow(part);
}
function handleInput(input) {
    const partId = input.dataset.part;
    const part = PARTS.find(p => p.id === partId);
    const key = `${currentSchool.id}_${currentKit.id}_${partId}`;
    let val = input.value.trim();
    if (val === '') {
        if (!pendingChanges[key]) pendingChanges[key] = {};
        pendingChanges[key][currentSemester] = '';
    } else {
        val = Math.max(0, Math.min(parseInt(val) || 0, part.expected));
        if (!pendingChanges[key]) pendingChanges[key] = {};
        pendingChanges[key][currentSemester] = val;
    }
    hasUnsavedChanges = true;
    updateSaveStatus();
    const row = document.querySelector(`[data-part="${partId}"]`);
    if (row) row.outerHTML = renderPartRow(part);
}
function updateSaveStatus() {
    const status = document.getElementById('save-status');
    const text = document.getElementById('save-text');
    if (hasUnsavedChanges) {
        status.className = 'save-status unsaved';
        text.textContent = 'Unsaved';
    } else {
        status.className = 'save-status saved';
        text.textContent = 'Saved';
    }
}
function saveChanges() {
    Object.keys(pendingChanges).forEach(key => {
        if (!inventoryData[key]) inventoryData[key] = {};
        Object.assign(inventoryData[key], pendingChanges[key]);
    });
    saveData();
    pendingChanges = {};
    hasUnsavedChanges = false;
    updateSaveStatus();
    document.getElementById('save-text').textContent = '✓ Saved!';
    setTimeout(() => { if (!hasUnsavedChanges) document.getElementById('save-text').textContent = 'Saved'; }, 1500);
}
function confirmClear() { openModal('confirm-clear-modal'); }
function clearInventory() {
    PARTS.forEach(p => {
        const key = `${currentSchool.id}_${currentKit.id}_${p.id}`;
        if (!pendingChanges[key]) pendingChanges[key] = {};
        pendingChanges[key][currentSemester] = '';
    });
    hasUnsavedChanges = true;
    closeModal('confirm-clear-modal');
    renderInventory();
}

// ========== MODALS ==========
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
});

// ========== AUTO-BACKUP ==========
setInterval(() => {
    if (hasUnsavedChanges) {
        Object.keys(pendingChanges).forEach(key => {
            if (!inventoryData[key]) inventoryData[key] = {};
            Object.assign(inventoryData[key], pendingChanges[key]);
        });
        localStorage.setItem('js_inventory', JSON.stringify(inventoryData));
    }
}, 30000);

// ========== INIT ==========
loadData();
const savedUser = localStorage.getItem('js_user');
if (savedUser) { currentUser = savedUser; showScreen('school-screen'); }

window.addEventListener('beforeunload', e => {
    if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
});
