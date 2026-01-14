// ========== CONFIG ==========
const PASSWORDS = { admin: 'admin2025', instructor: 'instructor2025' };

// ========== PARTS ==========
const CATEGORIES = [
    { name: 'Electronics', icon: '⚡', parts: [
        { id: 'large_hub', name: 'Large Hub', expected: 1 },
        { id: 'hub_battery', name: 'Hub Battery', expected: 1 },
        { id: 'medium_motor', name: 'Medium Motor', expected: 2 },
        { id: 'large_motor', name: 'Large Motor', expected: 1 },
        { id: 'color_sensor', name: 'Color Sensor', expected: 1 },
        { id: 'distance_sensor', name: 'Distance Sensor', expected: 1 },
        { id: 'force_sensor', name: 'Force Sensor', expected: 1 },
        { id: 'micro_usb', name: 'USB Cable', expected: 1 }
    ]},
    { name: 'Beams', icon: '🔧', parts: [
        { id: 'beam_3m', name: 'Beam 3M', expected: 6 },
        { id: 'beam_5m', name: 'Beam 5M', expected: 4 },
        { id: 'beam_7m', name: 'Beam 7M', expected: 6 },
        { id: 'beam_9m', name: 'Beam 9M', expected: 4 },
        { id: 'beam_11m', name: 'Beam 11M', expected: 4 },
        { id: 'beam_13m', name: 'Beam 13M', expected: 4 },
        { id: 'beam_15m', name: 'Beam 15M', expected: 6 }
    ]},
    { name: 'Frames', icon: '⬜', parts: [
        { id: 'frame_5x7', name: 'Frame 5×7', expected: 2 },
        { id: 'frame_7x11', name: 'Frame 7×11', expected: 2 },
        { id: 'frame_11x15', name: 'Frame 11×15', expected: 1 }
    ]},
    { name: 'Connectors', icon: '🔩', parts: [
        { id: 'peg_black', name: 'Black Pegs', expected: 72 },
        { id: 'peg_blue', name: 'Blue Pegs', expected: 20 },
        { id: 'bush', name: 'Bush', expected: 10 }
    ]},
    { name: 'Wheels & Gears', icon: '⚙️', parts: [
        { id: 'wheel_56', name: 'Wheel Ø56', expected: 4 },
        { id: 'gear_12', name: 'Gear Z12', expected: 2 },
        { id: 'gear_20', name: 'Gear Z20', expected: 2 },
        { id: 'gear_36', name: 'Gear Z36', expected: 2 }
    ]},
    { name: 'Miscellaneous', icon: '📦', parts: [
        { id: 'minifig_kate', name: 'Kate Minifigure', expected: 1 },
        { id: 'minifig_kyle', name: 'Kyle Minifigure', expected: 1 },
        { id: 'storage_box', name: 'Storage Box', expected: 1 },
        { id: 'sorting_trays', name: 'Sorting Trays', expected: 2 }
    ]}
];
const PARTS = CATEGORIES.flatMap(c => c.parts);

// ========== STATE ==========
let currentUser = null, userRole = null, schools = [], currentSchool = null, currentKit = null;
let inventoryData = {}, pendingChanges = {}, hasUnsavedChanges = false;
let currentFilter = 'all', currentSemester = 'start', editingSchoolId = null, editingKitId = null;

// ========== STORAGE ==========
const loadData = () => {
    schools = JSON.parse(localStorage.getItem('js_schools') || '[]');
    inventoryData = JSON.parse(localStorage.getItem('js_inventory') || '{}');
};
const saveData = () => {
    localStorage.setItem('js_schools', JSON.stringify(schools));
    localStorage.setItem('js_inventory', JSON.stringify(inventoryData));
};

// ========== HELPERS ==========
const formatDate = d => d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Not set';
const isDeadlinePassed = d => d ? new Date() > new Date(d+'T23:59:59') : false;
const daysUntil = d => d ? Math.ceil((new Date(d+'T23:59:59') - new Date()) / 86400000) : null;
const isAdmin = () => userRole === 'admin';
const canEditSemester = sem => isAdmin() || !isDeadlinePassed(currentSchool?.[sem === 'start' ? 'startDeadline' : 'endDeadline']);

// ========== AUTH ==========
function logout() {
    if (hasUnsavedChanges && !confirm('Unsaved changes will be lost. Continue?')) return;
    currentUser = userRole = null;
    localStorage.removeItem('js_user');
    localStorage.removeItem('js_role');
    document.getElementById('email-input').value = '';
    document.getElementById('password-input').value = '';
    showScreen('login-screen');
}

// ========== NAVIGATION ==========
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'school-screen') { updateRoleBadge(); renderSchools(); }
    else if (id === 'kit-screen') { currentFilter = 'all'; renderKits(); updateKitUI(); }
    else if (id === 'inventory-screen') { renderInventory(); updateInventoryUI(); }
}

function goBack() {
    if (hasUnsavedChanges && !confirm('Unsaved changes will be lost?')) return;
    hasUnsavedChanges = false; pendingChanges = {};
    showScreen('kit-screen');
}

function updateRoleBadge() {
    const b = document.getElementById('role-badge-schools');
    b.textContent = isAdmin() ? 'Admin' : 'Instructor';
    b.className = 'role-badge ' + userRole;
    document.getElementById('user-display').textContent = currentUser;
    document.getElementById('add-school-btn').style.display = isAdmin() ? 'block' : 'none';
}

// ========== SCHOOLS ==========
function renderSchools() {
    const list = document.getElementById('school-list'), empty = document.getElementById('school-empty');
    if (!schools.length) { list.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    list.innerHTML = schools.map(s => {
        const stats = getSchoolStats(s);
        let sc = 'complete', st = 'All Complete';
        if (stats.issues > 0) { sc = 'issues'; st = stats.issues + ' Issues'; }
        else if (stats.pending > 0) { sc = 'pending'; st = stats.pending + ' Pending'; }
        const ss = isDeadlinePassed(s.startDeadline) ? 'expired' : s.startDeadline ? 'active' : 'pending';
        const es = isDeadlinePassed(s.endDeadline) ? 'expired' : s.endDeadline ? 'active' : 'pending';
        return `<div class="school-card" onclick="selectSchool('${s.id}')">
            <div class="school-info">
                <div class="school-header"><h3>${s.name}</h3>
                ${isAdmin() ? `<button class="kit-menu" onclick="event.stopPropagation();openEditSchool('${s.id}')">⚙️</button>` : ''}</div>
                <div class="school-meta"><span class="status-dot ${sc}"></span><span>${(s.kits||[]).length} Kits • ${st}</span></div>
                <div class="school-deadlines"><span><span class="deadline-dot ${ss}"></span> Start: ${formatDate(s.startDeadline)}</span>
                <span><span class="deadline-dot ${es}"></span> End: ${formatDate(s.endDeadline)}</span></div>
            </div><span class="chevron">›</span></div>`;
    }).join('');
}

function getSchoolStats(school) {
    let pending = 0, issues = 0;
    (school.kits || []).forEach(k => { const s = getKitStatus(school.id, k.id); if (s === 'pending') pending++; else if (s === 'issues') issues++; });
    return { pending, issues };
}

function filterSchools() {
    const q = document.getElementById('school-search').value.toLowerCase();
    document.querySelectorAll('.school-card').forEach(c => { c.style.display = c.querySelector('h3').textContent.toLowerCase().includes(q) ? 'flex' : 'none'; });
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
    schools.push({ id: 'school_' + Date.now(), name, kits: [],
        startDeadline: document.getElementById('new-school-start-deadline').value || null,
        endDeadline: document.getElementById('new-school-end-deadline').value || null });
    saveData(); closeModal('add-school-modal');
    document.getElementById('new-school-name').value = '';
    document.getElementById('new-school-start-deadline').value = '';
    document.getElementById('new-school-end-deadline').value = '';
    renderSchools();
}

function openEditSchool(id) {
    editingSchoolId = id; const s = schools.find(x => x.id === id);
    document.getElementById('edit-school-name').value = s.name;
    document.getElementById('edit-school-start-deadline').value = s.startDeadline || '';
    document.getElementById('edit-school-end-deadline').value = s.endDeadline || '';
    openModal('edit-school-modal');
}

function saveSchoolEdit() {
    const s = schools.find(x => x.id === editingSchoolId);
    s.name = document.getElementById('edit-school-name').value.trim() || s.name;
    s.startDeadline = document.getElementById('edit-school-start-deadline').value || null;
    s.endDeadline = document.getElementById('edit-school-end-deadline').value || null;
    saveData(); closeModal('edit-school-modal'); renderSchools();
}

function deleteSchool() {
    if (!confirm('Delete this school and all data?')) return;
    schools = schools.filter(s => s.id !== editingSchoolId);
    Object.keys(inventoryData).forEach(k => { if (k.startsWith(editingSchoolId)) delete inventoryData[k]; });
    saveData(); closeModal('edit-school-modal'); renderSchools();
}

function openSchoolSettings() {
    document.getElementById('settings-school-name').value = currentSchool.name;
    document.getElementById('settings-start-deadline').value = currentSchool.startDeadline || '';
    document.getElementById('settings-end-deadline').value = currentSchool.endDeadline || '';
    openModal('school-settings-modal');
}

function saveSchoolSettings() {
    currentSchool.name = document.getElementById('settings-school-name').value.trim() || currentSchool.name;
    currentSchool.startDeadline = document.getElementById('settings-start-deadline').value || null;
    currentSchool.endDeadline = document.getElementById('settings-end-deadline').value || null;
    saveData(); closeModal('school-settings-modal');
    document.getElementById('nav-school-name').textContent = currentSchool.name;
    renderKits();
}

function deleteCurrentSchool() {
    if (!confirm('Delete this school?')) return;
    schools = schools.filter(s => s.id !== currentSchool.id);
    Object.keys(inventoryData).forEach(k => { if (k.startsWith(currentSchool.id)) delete inventoryData[k]; });
    saveData(); closeModal('school-settings-modal'); showScreen('school-screen');
}

// ========== KITS ==========
function updateKitUI() {
    document.getElementById('school-settings-btn').style.display = isAdmin() ? 'block' : 'none';
    const alert = document.getElementById('kit-deadline-alert');
    let html = '';
    if (!isAdmin()) {
        const sd = daysUntil(currentSchool.startDeadline), ed = daysUntil(currentSchool.endDeadline);
        if (sd !== null && sd > 0 && sd <= 3) html += `<div class="alert-box warning">⏰ Start deadline in ${sd} day${sd>1?'s':''}</div>`;
        if (ed !== null && ed > 0 && ed <= 3) html += `<div class="alert-box warning">⏰ End deadline in ${ed} day${ed>1?'s':''}</div>`;
        if (isDeadlinePassed(currentSchool.startDeadline) && isDeadlinePassed(currentSchool.endDeadline))
            html = '<div class="alert-box danger">🔒 All deadlines passed - View only</div>';
    }
    alert.innerHTML = html;
}

function renderKits() {
    const grid = document.getElementById('kit-grid'), empty = document.getElementById('kit-empty'), kits = currentSchool.kits || [];
    let pending = 0, issues = 0;
    kits.forEach(k => { const s = getKitStatus(currentSchool.id, k.id); if (s === 'pending') pending++; else if (s === 'issues') issues++; });
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('issues-count').textContent = issues;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === currentFilter));
    const filtered = kits.filter(k => currentFilter === 'all' || getKitStatus(currentSchool.id, k.id) === currentFilter);
    if (!kits.length) { grid.innerHTML = ''; empty.style.display = 'block'; empty.innerHTML = '<p>No kits yet</p>'; return; }
    if (!filtered.length) { grid.innerHTML = ''; empty.style.display = 'block'; empty.innerHTML = `<p>No ${currentFilter} kits</p>`; return; }
    empty.style.display = 'none';
    grid.innerHTML = filtered.map(k => {
        const idx = kits.indexOf(k) + 1, status = getKitStatus(currentSchool.id, k.id), miss = getMissing(currentSchool.id, k.id);
        let sh = status === 'complete' ? '<div class="kit-status complete">● Complete</div>' :
                 status === 'issues' ? `<div class="kit-status issues">● ${miss} Missing</div>` :
                 '<div class="kit-status pending">● Pending</div>';
        return `<div class="kit-card" onclick="selectKit('${k.id}')"><div class="kit-header">
            <span class="kit-name">${k.name || 'Kit ' + idx}</span>
            <button class="kit-menu" onclick="event.stopPropagation();openEditKit('${k.id}')">•••</button></div>${sh}</div>`;
    }).join('');
}

function getKitStatus(sid, kid) {
    let hasStart = false, hasEnd = false, hasIssue = false;
    PARTS.forEach(p => {
        const d = inventoryData[`${sid}_${kid}_${p.id}`];
        if (d) {
            if (d.start !== undefined && d.start !== '') hasStart = true;
            if (d.end !== undefined && d.end !== '') {
                hasEnd = true;
                const sv = d.start !== '' && d.start !== undefined ? parseInt(d.start) : p.expected;
                if (parseInt(d.end) < sv) hasIssue = true;
            }
        }
    });
    return hasIssue ? 'issues' : hasEnd ? 'complete' : 'pending';
}

function getMissing(sid, kid) {
    let m = 0;
    PARTS.forEach(p => {
        const d = inventoryData[`${sid}_${kid}_${p.id}`];
        if (d && d.end !== undefined && d.end !== '') {
            const sv = d.start !== '' && d.start !== undefined ? parseInt(d.start) : p.expected;
            if (parseInt(d.end) < sv) m += sv - parseInt(d.end);
        }
    });
    return m;
}

function setFilter(f) { currentFilter = f; renderKits(); }

function selectKit(id) {
    currentKit = currentSchool.kits.find(k => k.id === id);
    const idx = currentSchool.kits.indexOf(currentKit) + 1;
    document.getElementById('nav-kit-name').textContent = currentKit.name || 'Kit ' + idx;
    document.getElementById('inventory-title').textContent = (currentKit.name || 'Kit ' + idx) + ' Inventory';
    hasUnsavedChanges = false; pendingChanges = {}; currentSemester = 'start';
    showScreen('inventory-screen');
}

function addKit() {
    if (!currentSchool.kits) currentSchool.kits = [];
    currentSchool.kits.push({ id: 'kit_' + Date.now(), name: document.getElementById('new-kit-name').value.trim() });
    saveData(); closeModal('add-kit-modal'); document.getElementById('new-kit-name').value = ''; renderKits();
}

function openEditKit(id) {
    editingKitId = id;
    document.getElementById('edit-kit-name').value = currentSchool.kits.find(k => k.id === id).name || '';
    openModal('edit-kit-modal');
}

function saveKitEdit() {
    currentSchool.kits.find(k => k.id === editingKitId).name = document.getElementById('edit-kit-name').value.trim();
    saveData(); closeModal('edit-kit-modal'); renderKits();
}

function deleteKit() {
    if (!confirm('Delete this kit?')) return;
    currentSchool.kits = currentSchool.kits.filter(k => k.id !== editingKitId);
    Object.keys(inventoryData).forEach(k => { if (k.includes(editingKitId)) delete inventoryData[k]; });
    saveData(); closeModal('edit-kit-modal'); renderKits();
}

// ========== INVENTORY ==========
function updateInventoryUI() {
    const canS = canEditSemester('start'), canE = canEditSemester('end'), canC = currentSemester === 'start' ? canS : canE;
    document.getElementById('start-lock').textContent = canS ? '' : ' 🔒';
    document.getElementById('end-lock').textContent = canE ? '' : ' 🔒';
    document.querySelectorAll('.semester-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.sem === currentSemester);
        t.classList.toggle('locked', t.dataset.sem === 'start' ? !canS : !canE);
    });
    const di = document.getElementById('deadline-info'), df = currentSemester === 'start' ? 'startDeadline' : 'endDeadline', dl = currentSchool[df];
    if (dl) {
        const days = daysUntil(dl);
        if (isDeadlinePassed(dl)) { di.style.display = 'flex'; di.className = 'deadline-info expired'; di.innerHTML = `🔒 Deadline passed (${formatDate(dl)})${isAdmin() ? ' - Admin override' : ''}`; }
        else if (days <= 3) { di.style.display = 'flex'; di.className = 'deadline-info'; di.innerHTML = `⏰ ${days} day${days !== 1 ? 's' : ''} until deadline`; }
        else { di.style.display = 'flex'; di.className = 'deadline-info active'; di.innerHTML = `✓ Deadline: ${formatDate(dl)}`; }
    } else di.style.display = 'none';
    document.getElementById('clear-btn').style.display = canC ? 'block' : 'none';
    document.getElementById('save-btn').style.display = canC ? 'block' : 'none';
}

function setSemester(s) { currentSemester = s; renderInventory(); updateInventoryUI(); }

function renderInventory() {
    updateSaveStatus();
    const canE = canEditSemester(currentSemester);
    document.getElementById('categories').innerHTML = CATEGORIES.map(cat => `
        <div class="category"><div class="category-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <span class="category-name">${cat.icon} ${cat.name}</span><span class="category-chevron">▼</span></div>
        <div class="category-items">${cat.parts.map(p => renderPart(p, canE)).join('')}</div></div>`).join('');
}

function renderPart(part, canE) {
    const key = `${currentSchool.id}_${currentKit.id}_${part.id}`, d = inventoryData[key] || {}, pend = pendingChanges[key] || {};
    const val = pend[currentSemester] !== undefined ? pend[currentSemester] : (d[currentSemester] ?? '');
    const num = val === '' ? null : parseInt(val);
    let badge = '<span class="part-badge empty">—</span>';
    if (num !== null) badge = num >= part.expected ? '<span class="part-badge ok">OK</span>' : `<span class="part-badge missing">-${part.expected - num}</span>`;
    const cat = CATEGORIES.find(c => c.parts.includes(part));
    const mDis = !canE || num === null || num <= 0 ? 'disabled' : '', pDis = !canE || num >= part.expected ? 'disabled' : '';
    return `<div class="part-row" data-part="${part.id}"><div class="part-info">
        <div class="part-icon">${cat?.icon || '📦'}</div><div class="part-details">
        <div class="part-name">${part.name}</div><div class="part-expected">Expected: ${part.expected}</div></div></div>
        <div class="part-controls"><div class="counter">
        <button class="counter-btn" onclick="adjust('${part.id}',-1)" ${mDis}>−</button>
        <input type="text" class="counter-value" value="${num !== null ? num : ''}" data-part="${part.id}" onchange="handleInput(this)" onfocus="this.select()" inputmode="numeric" ${!canE ? 'disabled' : ''}>
        <button class="counter-btn" onclick="adjust('${part.id}',1)" ${pDis}>+</button></div>${badge}</div></div>`;
}

function adjust(pid, delta) {
    if (!canEditSemester(currentSemester)) return;
    const key = `${currentSchool.id}_${currentKit.id}_${pid}`, part = PARTS.find(p => p.id === pid);
    const d = inventoryData[key] || {}, pend = pendingChanges[key] || {};
    let val = pend[currentSemester] !== undefined ? pend[currentSemester] : (d[currentSemester] ?? '');
    val = val === '' ? part.expected : parseInt(val);
    val = Math.max(0, Math.min(val + delta, part.expected));
    if (!pendingChanges[key]) pendingChanges[key] = {};
    pendingChanges[key][currentSemester] = val;
    hasUnsavedChanges = true; updateSaveStatus();
    const row = document.querySelector(`[data-part="${pid}"]`);
    if (row) row.outerHTML = renderPart(part, canEditSemester(currentSemester));
}

function handleInput(inp) {
    if (!canEditSemester(currentSemester)) return;
    const pid = inp.dataset.part, part = PARTS.find(p => p.id === pid), key = `${currentSchool.id}_${currentKit.id}_${pid}`;
    let val = inp.value.trim();
    if (!pendingChanges[key]) pendingChanges[key] = {};
    pendingChanges[key][currentSemester] = val === '' ? '' : Math.max(0, Math.min(parseInt(val) || 0, part.expected));
    hasUnsavedChanges = true; updateSaveStatus();
    const row = document.querySelector(`[data-part="${pid}"]`);
    if (row) row.outerHTML = renderPart(part, canEditSemester(currentSemester));
}

function updateSaveStatus() {
    const st = document.getElementById('save-status'), tx = document.getElementById('save-text'), canE = canEditSemester(currentSemester);
    if (!canE && !isAdmin()) { st.className = 'save-status locked'; tx.textContent = '🔒 Locked'; }
    else if (hasUnsavedChanges) { st.className = 'save-status unsaved'; tx.textContent = 'Unsaved'; }
    else { st.className = 'save-status saved'; tx.textContent = 'Saved'; }
}

function saveChanges() {
    Object.keys(pendingChanges).forEach(k => { if (!inventoryData[k]) inventoryData[k] = {}; Object.assign(inventoryData[k], pendingChanges[k]); });
    saveData(); pendingChanges = {}; hasUnsavedChanges = false; updateSaveStatus();
    document.getElementById('save-text').textContent = '✓ Saved!';
    setTimeout(() => { if (!hasUnsavedChanges) updateSaveStatus(); }, 1500);
}

function confirmClear() { openModal('confirm-clear-modal'); }
function clearInventory() {
    PARTS.forEach(p => { const k = `${currentSchool.id}_${currentKit.id}_${p.id}`; if (!pendingChanges[k]) pendingChanges[k] = {}; pendingChanges[k][currentSemester] = ''; });
    hasUnsavedChanges = true; closeModal('confirm-clear-modal'); renderInventory(); updateInventoryUI();
}

// ========== MODALS ==========
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));

// ========== INIT ==========
loadData();
const savedUser = localStorage.getItem('js_user'), savedRole = localStorage.getItem('js_role');
if (savedUser && savedRole) { currentUser = savedUser; userRole = savedRole; showScreen('school-screen'); }

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email-input').value.trim().toLowerCase(), pw = document.getElementById('password-input').value;
    document.getElementById('email-error').classList.remove('show');
    document.getElementById('password-error').classList.remove('show');
    if (!email.endsWith('@mystemclub.org')) { document.getElementById('email-error').classList.add('show'); return; }
    if (pw === PASSWORDS.admin) userRole = 'admin';
    else if (pw === PASSWORDS.instructor) userRole = 'instructor';
    else { document.getElementById('password-error').classList.add('show'); return; }
    currentUser = email.split('@')[0];
    localStorage.setItem('js_user', currentUser); localStorage.setItem('js_role', userRole);
    showScreen('school-screen');
});

window.addEventListener('beforeunload', e => { if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; } });

// Auto-backup every 30s
setInterval(() => { if (hasUnsavedChanges) { Object.keys(pendingChanges).forEach(k => { if (!inventoryData[k]) inventoryData[k] = {}; Object.assign(inventoryData[k], pendingChanges[k]); }); localStorage.setItem('js_inventory', JSON.stringify(inventoryData)); } }, 30000);
