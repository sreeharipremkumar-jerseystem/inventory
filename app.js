// ========== CONFIG ==========
const PASSWORDS = {
    admin: 'admin2025',
    instructor: 'instructor2025'
};

// ========== PARTS BY CATEGORY ==========
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
        { id: 'frame_11x15', name: 'Frame 11×15', expected: 1 },
        { id: 'i_frame', name: 'I-Frame 3×5', expected: 3 }
    ]},
    { name: 'Angular Beams', icon: '📐', parts: [
        { id: 'angular_4x4', name: 'Angular 4×4', expected: 4 },
        { id: 'angular_3x7_45', name: 'Angular 3×7 (45°)', expected: 4 },
        { id: 'angular_2x4_90', name: 'Angular 2×4 (90°)', expected: 4 },
        { id: 'angular_3x5_90', name: 'Angular 3×5 (90°)', expected: 4 }
    ]},
    { name: 'Axles', icon: '➖', parts: [
        { id: 'axle_2m', name: 'Axle 2M', expected: 10 },
        { id: 'axle_3m', name: 'Axle 3M', expected: 8 },
        { id: 'axle_4m', name: 'Axle 4M', expected: 4 },
        { id: 'axle_5m', name: 'Axle 5M', expected: 4 },
        { id: 'axle_7m', name: 'Axle 7M', expected: 4 },
        { id: 'axle_8m', name: 'Axle 8M', expected: 4 },
        { id: 'axle_9m', name: 'Axle 9M', expected: 4 }
    ]},
    { name: 'Connectors', icon: '🔩', parts: [
        { id: 'peg_black', name: 'Black Pegs', expected: 72 },
        { id: 'peg_blue', name: 'Blue Pegs', expected: 20 },
        { id: 'peg_3m', name: 'Peg 3M', expected: 10 },
        { id: 'bush', name: 'Bush', expected: 10 },
        { id: 'connector_3m', name: 'Connector 3M', expected: 12 }
    ]},
    { name: 'Wheels & Gears', icon: '⚙️', parts: [
        { id: 'wheel_56', name: 'Wheel Ø56', expected: 4 },
        { id: 'tyre', name: 'Tyre', expected: 4 },
        { id: 'gear_12', name: 'Gear Z12', expected: 2 },
        { id: 'gear_20', name: 'Gear Z20', expected: 2 },
        { id: 'gear_36', name: 'Gear Z36', expected: 2 }
    ]},
    { name: 'Plates & Panels', icon: '🟦', parts: [
        { id: 'panel_11x19', name: 'Panel 11×19', expected: 2 },
        { id: 'panel_3x11', name: 'Panel 3×11', expected: 2 },
        { id: 'plate_2x16', name: 'Plate 2×16', expected: 2 },
        { id: 'plate_2x8', name: 'Plate 2×8', expected: 4 }
    ]},
    { name: 'Miscellaneous', icon: '📦', parts: [
        { id: 'minifig_kate', name: 'Kate Minifigure', expected: 1 },
        { id: 'minifig_kyle', name: 'Kyle Minifigure', expected: 1 },
        { id: 'rubber_band', name: 'Rubber Bands', expected: 2 },
        { id: 'storage_box', name: 'Storage Box', expected: 1 },
        { id: 'sorting_trays', name: 'Sorting Trays', expected: 2 }
    ]}
];
const PARTS = CATEGORIES.flatMap(c => c.parts);

// ========== STATE ==========
let currentUser = null;
let userRole = null; // 'admin' or 'instructor'
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
const loadData = () => {
    schools = JSON.parse(localStorage.getItem('js_schools') || '[]');
    inventoryData = JSON.parse(localStorage.getItem('js_inventory') || '{}');
};
const saveData = () => {
    localStorage.setItem('js_schools', JSON.stringify(schools));
    localStorage.setItem('js_inventory', JSON.stringify(inventoryData));
};

// ========== DATE HELPERS ==========
const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const isDeadlinePassed = (dateStr) => {
    if (!dateStr) return false;
    const deadline = new Date(dateStr + 'T23:59:59');
    return new Date() > deadline;
};
const daysUntilDeadline = (dateStr) => {
    if (!dateStr) return null;
    const deadline = new Date(dateStr + 'T23:59:59');
    const now = new Date();
    const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return diff;
};

// ========== PERMISSION HELPERS ==========
const isAdmin = () => userRole === 'admin';
const canEditSchools = () => isAdmin();
const canDeleteSchools = () => isAdmin();
const canSetDeadlines = () => isAdmin();
const canEditSemester = (semester) => {
    if (isAdmin()) return true;
    if (!currentSchool) return false;
    const deadlineField = semester === 'start' ? 'startDeadline' : 'endDeadline';
    return !isDeadlinePassed(currentSchool[deadlineField]);
};

// ========== AUTH ==========
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email-input').value.trim().toLowerCase();
    const pw = document.getElementById('password-input').value;
    
    document.getElementById('email-error').classList.remove('show');
    document.getElementById('password-error').classList.remove('show');
    
    if (!email.endsWith('@mystemclub.org')) {
        document.getElementById('email-error').classList.add('show');
        return;
    }
    
    if (pw === PASSWORDS.admin) {
        userRole = 'admin';
    } else if (pw === PASSWORDS.instructor) {
        userRole = 'instructor';
    } else {
        document.getElementById('password-error').classList.add('show');
        return;
    }
    
    currentUser = email.split('@')[0];
    localStorage.setItem('js_user', currentUser);
    localStorage.setItem('js_role', userRole);
    showScreen('school-screen');
}

function logout() {
    if (hasUnsavedChanges && !confirm('Unsaved changes will be lost. Continue?')) return;
    currentUser = null;
    userRole = null;
    localStorage.removeItem('js_user');
    localStorage.removeItem('js_role');
    document.getElementById('email-input').value = '';
    document.getElementById('password-input').value = '';
    showScreen('login-screen');
}

// ========== UI UPDATES ==========
function updateUIForRole() {
    const badge = document.getElementById('role-badge-schools');
    badge.textContent = isAdmin() ? 'Admin' : 'Instructor';
    badge.className = `role-badge ${userRole}`;
    
    document.getElementById('user-display').textContent = currentUser;
    document.getElementById('add-school-btn').style.display = canEditSchools() ? 'block' : 'none';
}

// ========== NAVIGATION ==========
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (id === 'school-screen') {
        updateUIForRole();
        renderSchools();
    } else if (id === 'kit-screen') {
        currentFilter = 'all';
        renderKits();
        updateKitScreenUI();
    } else if (id === 'inventory-screen') {
        renderInventory();
        updateInventoryUI();
    }
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
    
    if (schools.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    
    list.innerHTML = schools.map(s => {
        const stats = getSchoolStats(s);
        let statusClass = 'complete', statusText = 'All Complete';
        if (stats.issues > 0) { statusClass = 'issues'; statusText = `${stats.issues} Issues`; }
        else if (stats.pending > 0) { statusClass = 'pending'; statusText = `${stats.pending} Pending`; }
        
        const startStatus = isDeadlinePassed(s.startDeadline) ? 'expired' : (s.startDeadline ? 'active' : 'pending');
        const endStatus = isDeadlinePassed(s.endDeadline) ? 'expired' : (s.endDeadline ? 'active' : 'pending');
        
        return `
            <div class="school-card" onclick="selectSchool('${s.id}')">
                <div class="school-info">
                    <div class="school-header">
                        <h3>${s.name}</h3>
                        ${isAdmin() ? `<button class="kit-menu" onclick="event.stopPropagation();openEditSchool('${s.id}')" style="font-size:18px;">⚙️</button>` : ''}
                    </div>
                    <div class="school-meta">
                        <span class="status-dot ${statusClass}"></span>
                        <span>${s.kits?.length || 0} Kits • ${statusText}</span>
                    </div>
                    <div class="school-deadlines">
                        <span><span class="deadline-dot ${startStatus}"></span> Start: ${formatDate(s.startDeadline)}</span>
                        <span><span class="deadline-dot ${endStatus}"></span> End: ${formatDate(s.endDeadline)}</span>
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
    
    const school = {
        id: 'school_' + Date.now(),
        name,
        kits: [],
        startDeadline: document.getElementById('new-school-start-deadline').value || null,
        endDeadline: document.getElementById('new-school-end-deadline').value || null
    };
    schools.push(school);
    saveData();
    closeModal('add-school-modal');
    document.getElementById('new-school-name').value = '';
    document.getElementById('new-school-start-deadline').value = '';
    document.getElementById('new-school-end-deadline').value = '';
    renderSchools();
}

function openEditSchool(id) {
    editingSchoolId = id;
    const s = schools.find(x => x.id === id);
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
    saveData();
    closeModal('edit-school-modal');
    renderSchools();
}

function deleteSchool() {
    if (!confirm('Delete this school and all its data?')) return;
    schools = schools.filter(s => s.id !== editingSchoolId);
    Object.keys(inventoryData).forEach(k => { if (k.startsWith(editingSchoolId)) delete inventoryData[k]; });
    saveData();
    closeModal('edit-school-modal');
    renderSchools();
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
    saveData();
    closeModal('school-settings-modal');
    document.getElementById('nav-school-name').textContent = currentSchool.name;
    renderKits();
}

function deleteCurrentSchool() {
    if (!confirm('Delete this school and all its data?')) return;
    schools = schools.filter(s => s.id !== currentSchool.id);
    Object.keys(inventoryData).forEach(k => { if (k.startsWith(currentSchool.id)) delete inventoryData[k]; });
    saveData();
    closeModal('school-settings-modal');
    showScreen('school-screen');
}

// ========== KITS ==========
function updateKitScreenUI() {
    document.getElementById('school-settings-btn').style.display = isAdmin() ? 'block' : 'none';
    document.getElementById('add-kit-btn').style.display = 'block'; // Both can add kits
    
    // Show deadline alerts
    const alertDiv = document.getElementById('kit-deadline-alert');
    const startDays = daysUntilDeadline(currentSchool.startDeadline);
    const endDays = daysUntilDeadline(currentSchool.endDeadline);
    
    let alerts = [];
    if (!isAdmin()) {
        if (startDays !== null && startDays > 0 && startDays <= 3) {
            alerts.push(`<div class="alert-box warning">⏰ Start semester deadline in ${startDays} day${startDays > 1 ? 's' : ''}</div>`);
        }
        if (endDays !== null && endDays > 0 && endDays <= 3) {
            alerts.push(`<div class="alert-box warning">⏰ End semester deadline in ${endDays} day${endDays > 1 ? 's' : ''}</div>`);
        }
        if (isDeadlinePassed(currentSchool.startDeadline) && isDeadlinePassed(currentSchool.endDeadline)) {
            alerts.push(`<div class="alert-box danger">🔒 All deadlines passed - View only mode</div>`);
        }
    }
    alertDiv.innerHTML = alerts.join('');
}

function renderKits() {
    const grid = document.getElementById('kit-grid');
    const empty = document.getElementById('kit-empty');
    const kits = currentSchool.kits || [];
    
    let pending = 0, issues = 0;
    kits.forEach(k => {
        const st = getKitStatus(currentSchool.id, k.id);
        if (st === 'pending') pending++;
        else if (st === 'issues') issues++;
    });
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('issues-count').textContent = issues;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    });
    
    const filtered = kits.filter(k => {
        if (currentFilter === 'all') return true;
        return getKitStatus(currentSchool.id, k.id) === currentFilter;
    });
    
    if (kits.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        empty.innerHTML = '<p>No kits yet</p><button class="btn" style="width:auto;padding:12px 24px;" onclick="openModal(\'add-kit-modal\')">+ Add Kit</button>';
        return;
    }
    empty.style.display = filtered.length === 0 ? 'block' : 'none';
    if (filtered.length === 0) {
        empty.innerHTML = `<p>No ${currentFilter} kits</p>`;
        grid.innerHTML = '';
        return;
    }
    
    grid.innerHTML = filtered.map(k => {
        const idx = kits.indexOf(k) + 1;
        const status = getKitStatus(currentSchool.id, k.id);
        const missing = getMissingCount(currentSchool.id, k.id);
        let statusHtml = '';
        if (status === 'complete') statusHtml = `<div class="kit-status complete">● Complete</div>`;
        else if (status === 'issues') statusHtml = `<div class="kit-status issues">● ${missing} Missing</div>`;
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
    if (!confirm('Delete this kit and its inventory?')) return;
    currentSchool.kits = currentSchool.kits.filter(k => k.id !== editingKitId);
    Object.keys(inventoryData).forEach(key => { if (key.includes(editingKitId)) delete inventoryData[key]; });
    saveData();
    closeModal('edit-kit-modal');
    renderKits();
}

// ========== INVENTORY ==========
function updateInventoryUI() {
    const canEditStart = canEditSemester('start');
    const canEditEnd = canEditSemester('end');
    const canEditCurrent = currentSemester === 'start' ? canEditStart : canEditEnd;
    
    // Update tabs
    document.getElementById('start-lock').textContent = canEditStart ? '' : ' 🔒';
    document.getElementById('end-lock').textContent = canEditEnd ? '' : ' 🔒';
    
    document.querySelectorAll('.semester-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.sem === currentSemester);
        const isLocked = t.dataset.sem === 'start' ? !canEditStart : !canEditEnd;
        t.classList.toggle('locked', isLocked && !isAdmin());
    });
    
    // Update deadline info
    const deadlineInfo = document.getElementById('deadline-info');
    const deadlineField = currentSemester === 'start' ? 'startDeadline' : 'endDeadline';
    const deadline = currentSchool[deadlineField];
    
    if (deadline) {
        const days = daysUntilDeadline(deadline);
        if (isDeadlinePassed(deadline)) {
            deadlineInfo.style.display = 'flex';
            deadlineInfo.className = 'deadline-info expired';
            deadlineInfo.innerHTML = `🔒 Deadline passed (${formatDate(deadline)})${isAdmin() ? ' - Admin override active' : ''}`;
        } else if (days <= 3) {
            deadlineInfo.style.display = 'flex';
            deadlineInfo.className = 'deadline-info';
            deadlineInfo.innerHTML = `⏰ ${days} day${days !== 1 ? 's' : ''} until deadline (${formatDate(deadline)})`;
        } else {
            deadlineInfo.style.display = 'flex';
            deadlineInfo.className = 'deadline-info active';
            deadlineInfo.innerHTML = `✓ Deadline: ${formatDate(deadline)}`;
        }
    } else {
        deadlineInfo.style.display = 'none';
    }
    
    // Update footer buttons
    document.getElementById('clear-btn').style.display = canEditCurrent ? 'block' : 'none';
    document.getElementById('save-btn').style.display = canEditCurrent ? 'block' : 'none';
    
    // Show view-only modal for instructors
    if (!canEditCurrent && !isAdmin() && !sessionStorage.getItem(`viewonly_${currentSchool.id}_${currentSemester}`)) {
        openModal('view-only-modal');
        sessionStorage.setItem(`viewonly_${currentSchool.id}_${currentSemester}`, 'shown');
    }
}

function setSemester(sem) {
    currentSemester = sem;
    renderInventory();
    updateInventoryUI();
}

function renderInventory() {
    updateSaveStatus();
    const canEdit = canEditSemester(currentSemester);
    const container = document.getElementById('categories');
    
    container.innerHTML = CATEGORIES.map(cat => `
        <div class="category" data-cat="${cat.name}">
            <div class="category-header" onclick="toggleCategory(this)">
                <span class="category-name">${cat.icon} ${cat.name}</span>
                <span class="category-chevron">▼</span>
            </div>
            <div class="category-items">
                ${cat.parts.map(p => renderPartRow(p, canEdit)).join('')}
            </div>
        </div>
    `).join('');
}

function renderPartRow(part, canEdit) {
    const key = `${currentSchool.id}_${currentKit.id}_${part.id}`;
    const data = inventoryData[key] || {};
    const pending = pendingChanges[key] || {};
    const val = pending[currentSemester] !== undefined ? pending[currentSemester] : (data[currentSemester] ?? '');
    const numVal = val === '' ? null : parseInt(val);
    
    let badge = '<span class="part-badge empty">—</span>';
    if (numVal !== null) {
        if (numVal >= part.expected) {
            badge = '<span class="part-badge ok">OK</span>';
        } else {
            badge = `<span class="part-badge missing">-${part.expected - numVal}</span>`;
        }
    }
    
    const cat = CATEGORIES.find(c => c.parts.includes(part));
    
    return `
        <div class="part-row ${!canEdit ? 'locked' : ''}" data-part="${part.id}">
            <div class="part-info">
                <div class="part-icon">${cat?.icon || '📦'}</div>
                <div class="part-details">
                    <div class="part-name">${part.name}</div>
                    <div class="part-expected">Expected: ${part.expected}</div>
                </div>
            </div>
            <div class="part-controls">
                <div class="counter">
                    <button class="counter-btn" onclick="adjust('${part.id}',-1)" ${!canEdit || numVal ===