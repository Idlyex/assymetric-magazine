(function() {
    const CONFIG = {
        serverUrl: 'http://localhost:4000',
        p: '#00f2fe', // selection accent
        h: '#f857a6', // hover accent
        bg: 'rgba(10, 11, 15, 0.88)'
    };

    let state = {
        active: false,
        selected: null,
        history: [],
        historyIndex: -1,
        pos: JSON.parse(localStorage.getItem('editor-panel-pos')) || { top: 40, left: 40 },
        collapsed: false,
    };

    const getProjectName = () => {
        const href = window.location.href;
        if (href.includes('editorial-grid')) return 'editorial-grid';
        if (href.includes('cinematic-full')) return 'cinematic-full';
        if (href.includes('assymetric-magazine')) return 'assymetric-magazine';
        const port = window.location.port;
        if (port === '3000') return 'editorial-grid';
        if (port === '3001') return 'cinematic-full';
        if (port === '3002') return 'assymetric-magazine';
        return 'cinematic-full';
    };

    const root = document.createElement('div');
    root.id = 'editor-root';
    document.body.appendChild(root);
    const shadow = root.attachShadow({ mode: 'open' });

    const styles = `
        * {
            transition: none !important;
            transition-delay: 0s !important;
            transition-duration: 0s !important;
            transition-property: none !important;
            animation: none !important;
            animation-delay: 0s !important;
            animation-duration: 0s !important;
        }
        :host {
            --p: ${CONFIG.p};
            --p-grad: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
            --h: ${CONFIG.h};
            --h-grad: linear-gradient(135deg, #f857a6 0%, #ff5858 100%);
            --bg: ${CONFIG.bg};
            font-family: 'Outfit', 'Inter', system-ui, sans-serif;
            color: #f1f5f9;
            z-index: 2147483647;
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
        }
        #panel {
            position: fixed;
            width: 350px;
            background: var(--bg);
            backdrop-filter: blur(25px) saturate(200%);
            -webkit-backdrop-filter: blur(25px) saturate(200%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), 
                        inset 0 1px 1px rgba(255, 255, 255, 0.1),
                        0 0 30px rgba(0, 242, 254, 0.05);
            display: flex;
            flex-direction: column;
            pointer-events: auto;
            z-index: 100;
            overflow: hidden;
        }
        #panel.hidden { display: none; }
        #panel.collapsed { height: 52px !important; overflow: hidden; }

        .header {
            padding: 14px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: move;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            user-select: none;
        }
        .header h3 {
            margin: 0;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 2px;
            background: var(--p-grad);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .header h3::before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 6px;
            background: #00f2fe;
            border-radius: 50%;
            box-shadow: 0 0 8px #00f2fe;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.6; }
            50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 12px #00f2fe; }
            100% { transform: scale(0.9); opacity: 0.6; }
        }
        .win-btn {
            width: 24px;
            height: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.6;
            transition: none !important;
            border-radius: 6px;
            font-size: 14px;
            line-height: 1;
        }
        .win-btn:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.05);
        }

        .tabs {
            display: flex;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            padding: 4px;
            gap: 2px;
        }
        .tab {
            flex: 1;
            padding: 10px 4px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-align: center;
            cursor: pointer;
            opacity: 0.5;
            transition: none !important;
            border-radius: 8px;
            border: 1px solid transparent;
        }
        .tab:hover {
            opacity: 0.9;
            background: rgba(255, 255, 255, 0.03);
        }
        .tab.active {
            opacity: 1;
            color: #00f2fe;
            background: rgba(0, 242, 254, 0.08);
            border: 1px solid rgba(0, 242, 254, 0.15);
            text-shadow: 0 0 10px rgba(0, 242, 254, 0.2);
        }

        .content {
            padding: 20px;
            max-height: 480px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
        .content::-webkit-scrollbar {
            width: 4px;
        }
        .content::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
        }
        .content::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .section { display: none; }
        .section.active { display: block; }

        .field { margin-bottom: 18px; }
        .field label {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: 700;
            color: rgba(255, 255, 255, 0.4);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .input-wrap {
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 2px 12px;
            transition: none !important;
        }
        .input-wrap:focus-within {
            border-color: #00f2fe;
            box-shadow: 0 0 15px rgba(0, 242, 254, 0.15);
            background: rgba(0, 242, 254, 0.02);
        }
        input, textarea {
            background: transparent;
            border: none;
            color: #f1f5f9;
            padding: 10px 0;
            width: 100%;
            font-size: 13px;
            outline: none;
            font-family: inherit;
        }
        textarea {
            height: 60px;
            resize: none;
            line-height: 1.5;
        }

        .hl {
            position: fixed;
            pointer-events: none;
            z-index: 2147483640;
            box-sizing: border-box;
            opacity: 0;
            transition: none !important;
            border-radius: 4px;
        }
        #hl-h {
            border: 1.5px dashed var(--h);
            box-shadow: 0 0 10px rgba(248, 87, 166, 0.2);
        }
        #hl-s {
            border: 2px solid var(--p);
            box-shadow: 0 0 20px rgba(0, 242, 254, 0.4), inset 0 0 10px rgba(0, 242, 254, 0.2);
        }

        button#save {
            background: var(--p-grad);
            color: #020617;
            border: none;
            padding: 14px;
            border-radius: 10px;
            font-weight: 800;
            width: 100%;
            cursor: pointer;
            font-size: 11px;
            text-transform: uppercase;
            margin-top: 10px;
            letter-spacing: 1.5px;
            box-shadow: 0 4px 20px rgba(0, 242, 254, 0.3);
            transition: none !important;
        }
        button#save:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0, 242, 254, 0.5);
            filter: brightness(1.1);
        }
        button#save:active {
            transform: translateY(0);
        }
        
        .p-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
        }
        .p-item {
            padding: 12px 16px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.01);
            transition: none !important;
        }
        .p-item:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(0, 242, 254, 0.3);
            transform: translateX(4px);
        }
        .p-preview {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        .p-color {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        #font-res {
            position: absolute;
            width: calc(100% - 40px);
            background: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 100;
            max-height: 150px;
            overflow-y: auto;
            display: none;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            margin-top: 4px;
        }
        .f-opt {
            padding: 10px 14px;
            cursor: pointer;
            font-size: 12px;
            transition: none !important;
        }
        .f-opt:hover {
            background: rgba(0, 242, 254, 0.1);
            color: #00f2fe;
            padding-left: 18px;
        }

        input[type="range"] {
            -webkit-appearance: none;
            width: 100%;
            background: rgba(255, 255, 255, 0.06);
            height: 6px;
            border-radius: 3px;
            outline: none;
            margin: 14px 0;
        }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #00f2fe;
            box-shadow: 0 0 10px #00f2fe;
            cursor: pointer;
            transition: none !important;
            border: 2px solid #ffffff;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.3);
            box-shadow: 0 0 15px #00f2fe, 0 0 25px #00f2fe;
        }

        .upload-btn {
            background: rgba(255, 255, 255, 0.02);
            color: #ffffff;
            border: 1px dashed rgba(255, 255, 255, 0.2);
            padding: 14px;
            border-radius: 10px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 800;
            cursor: pointer;
            width: 100%;
            transition: none !important;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .upload-btn:hover {
            border-color: #00f2fe;
            background: rgba(0, 242, 254, 0.04);
            box-shadow: 0 0 15px rgba(0, 242, 254, 0.15);
            color: #00f2fe;
        }
    `;

    const sheet = new CSSStyleSheet(); sheet.replaceSync(styles); shadow.adoptedStyleSheets = [sheet];

    const panel = document.createElement('div'); panel.id = 'panel'; panel.className = 'hidden';
    panel.style.top = state.pos.top + 'px'; panel.style.left = state.pos.left + 'px';
    panel.innerHTML = `
        <div class="header"><h3>Visual Pro</h3><div style="display:flex"><div class="win-btn" id="f-btn">_</div><div class="win-btn" id="c-btn">×</div></div></div>
        <div class="tabs"><div class="tab active" data-tab="t">Text</div><div class="tab" data-tab="s">Style</div><div class="tab" data-tab="m">Media</div><div class="tab" data-tab="p">Palette</div></div>
        <div class="content">
            <div class="section active" id="t">
                <div class="field"><label>Value</label><div class="input-wrap"><textarea id="i-v"></textarea></div></div>
                <div class="field"><label>Font</label><div class="input-wrap"><input id="i-f"></div><div id="font-res"></div></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                    <div class="field"><label>Size</label><div class="input-wrap"><input type="number" id="i-fs"></div></div>
                    <div class="field"><label>Height</label><div class="input-wrap"><input type="number" step="0.1" id="i-lh"></div></div>
                </div>
            </div>

            <div class="section" id="s">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                    <div class="field"><label>Margin</label><div class="input-wrap"><input type="number" id="i-mg"></div></div>
                    <div class="field"><label>Padding</label><div class="input-wrap"><input type="number" id="i-pd"></div></div>
                </div>
                <div class="field"><label>Radius</label><div class="input-wrap"><input type="number" id="i-br"></div></div>
            </div>

            <div class="section" id="m">
                <div class="field"><label>Zoom</label><input type="range" id="i-z" min="1" max="8" step="0.01" style="width:100%"></div>
                <div class="field"><label>Brightness</label><input type="range" id="i-b" min="0" max="200" step="1" style="width:100%"></div>
                <div class="field" style="display:flex;flex-direction:column;gap:8px">
                    <label>Image Source</label>
                    <input type="file" id="i-file" accept="image/*" style="display:none">
                    <button class="upload-btn" id="i-file-btn">
                        <svg style="width:12px;height:12px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                        Upload Image
                    </button>
                    <button class="upload-btn" id="i-reset-btn" style="border-color: rgba(248, 87, 166, 0.3);">
                        <svg style="width:12px;height:12px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                        </svg>
                        Reset Position & Zoom
                    </button>
                </div>
            </div>

            <div class="section" id="p">
                <div id="p-l" style="margin-bottom: 12px; max-height: 280px; overflow-y: auto; padding-right: 4px;"></div>
                <button class="upload-btn" id="apply-p-btn" style="border-color: rgba(0, 242, 254, 0.3); background: rgba(0, 242, 254, 0.02); color: #00f2fe; width: 100%;">
                    Apply to Stylesheet
                </button>
            </div>
            <button id="save">Push Updates</button>
        </div>
    `;
    shadow.appendChild(panel);

    const hlH = document.createElement('div'); hlH.id = 'hl-h'; hlH.className = 'hl'; shadow.appendChild(hlH);
    const hlS = document.createElement('div'); hlS.id = 'hl-s'; hlS.className = 'hl'; shadow.appendChild(hlS);

    function toResponsive(px) {
        if (px < 20) return (px/16).toFixed(3) + 'rem';
        const remMax = (px/16).toFixed(3) + 'rem';
        const remMin = (px * 0.5 / 16).toFixed(3) + 'rem'; 
        const vwFluid = (px / (1200 / 100)).toFixed(2) + 'vw'; 
        return `clamp(${remMin}, ${vwFluid}, ${remMax})`;
    }

    function formatCalc(val) {
        return `calc(50% ${val >= 0 ? '+' : '-'} ${Math.abs(val).toFixed(2)}px)`;
    }

    function updateHl(hl, el) {
        if (!el || !state.active) { hl.style.opacity = '0'; return; }
        const r = (el.tagName === 'IMG' && el.parentElement) ? el.parentElement.getBoundingClientRect() : el.getBoundingClientRect();
        hl.style.opacity = '1'; hl.style.top = r.top + 'px'; hl.style.left = r.left + 'px';
        hl.style.width = r.width + 'px'; hl.style.height = r.height + 'px';
    }

    function refresh() { updateHl(hlH, state.hovered); updateHl(hlS, state.selected); }
    window.addEventListener('scroll', refresh, true);
    window.addEventListener('resize', () => {
        document.querySelectorAll('img').forEach(img => {
            img.__rect = null;
        });
        refresh();
    });

    // Mousedown listener for immediate selection & drag initialization
    document.addEventListener('mousedown', (e) => {
        if (!state.active || root.contains(e.target)) return;
        
        const isImg = e.target.tagName === 'IMG';
        
        if (isImg) {
            e.preventDefault();
            e.stopPropagation();
            
            // Blur any active input/textarea immediately on image click
            const activeEl = shadow.activeElement || document.activeElement;
            if (activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) {
                activeEl.blur();
            }
        }
        
        if (state.selected !== e.target) {
            if (!isImg) {
                e.preventDefault();
                e.stopPropagation();
            }
            select(e.target);
        }
        
        // Immediately start dragging if we clicked an image
        if (isImg && e.target.__dragStart) {
            e.target.__dragStart(e);
        }
    }, true);

    document.addEventListener('click', (e) => {
        if (!state.active || root.contains(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
    }, true);

    document.addEventListener('dblclick', (e) => {
        if (!state.active || root.contains(e.target)) return;
        if (state.selected === e.target && e.target.tagName !== 'IMG') {
            e.target.contentEditable = 'true'; e.target.focus();
        }
    });

    function select(el) {
        if (state.selected) {
            state.selected.contentEditable = 'false';
            state.selected.style.removeProperty('transition');
            state.selected.classList.remove('editor-selected');
        }
        state.selected = el; 
        if (el) {
            el.style.setProperty('transition', 'none', 'important');
            el.classList.add('editor-selected');
            
            // Blur any active input/textarea to ensure shortcuts (like Ctrl+V) propagate
            if (el.tagName === 'IMG') {
                const activeEl = shadow.activeElement || document.activeElement;
                if (activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) {
                    activeEl.blur();
                }
            }
        }
        refresh();
        const s = window.getComputedStyle(el);
        shadow.getElementById('i-v').value = el.innerText || '';
        shadow.getElementById('i-fs').value = Math.round(parseFloat(s.fontSize)) || '';
        shadow.getElementById('i-lh').value = Math.round(parseFloat(s.lineHeight)/parseFloat(s.fontSize)*10)/10 || 1.2;
        shadow.getElementById('i-f').value = s.fontFamily.split(',')[0].replace(/['"]/g, '');
        shadow.getElementById('i-mg').value = parseInt(s.margin) || 0;
        shadow.getElementById('i-pd').value = parseInt(s.padding) || 0;
        shadow.getElementById('i-br').value = parseInt(s.borderRadius) || 0;
        if (el.tagName === 'IMG') { 
            switchTab('m'); 
            el.__rect = null; // Clear cached dimensions when selected
            setupImg(el); 
            // Bind sliders and inputs to selected image
            shadow.getElementById('i-z').value = el.__s.z;
            shadow.getElementById('i-z').oninput = (e) => { el.__s.z = parseFloat(e.target.value); el.__up(); };
            shadow.getElementById('i-b').value = el.__s.b;
            shadow.getElementById('i-b').oninput = (e) => { el.__s.b = e.target.value; el.__up(); };
        }
    }

    const toggleActive = (val) => {
        state.active = val;
        panel.classList.toggle('hidden', !state.active);
        
        let styleOverride = document.getElementById('editor-style-override');
        if (state.active) {
            if (!styleOverride) {
                styleOverride = document.createElement('style');
                styleOverride.id = 'editor-style-override';
                styleOverride.textContent = `
                    /* Disable CSS animations, transitions, and hover transforms while editing */
                    *, *::before, *::after {
                        transition: none !important;
                        transition-delay: 0s !important;
                        transition-duration: 0s !important;
                        transition-property: none !important;
                        animation: none !important;
                        animation-delay: 0s !important;
                        animation-duration: 0s !important;
                        scroll-behavior: auto !important;
                    /* Allow pointer clicks to pass through overlays cleanly to reach the image underneath */
                    .blog__card-overlay,
                    .portfolio__item-label,
                    .about__image-label,
                    .service-row__image::after,
                    .portfolio__item::after {
                        pointer-events: none !important;
                        opacity: 0 !important;
                    }
                    /* Make images targetable and prevent default OS ghost drags */
                    img {
                        pointer-events: auto !important;
                        user-select: none !important;
                        -webkit-user-drag: none !important;
                        transform-origin: center center !important;
                        transition: none !important;
                        animation: none !important;
                    }
                `;
                document.head.appendChild(styleOverride);
            }
            
            // Scan and setup all images on the page immediately
            document.querySelectorAll('img').forEach(img => {
                setupImg(img);
            });
            
            // Re-apply editor-selected and reset transitions on the selected element
            if (state.selected) {
                state.selected.classList.add('editor-selected');
                state.selected.style.setProperty('transition', 'none', 'important');
                if (state.selected.tagName === 'IMG') {
                    setupImg(state.selected);
                    
                    // Bind sliders to selected image
                    shadow.getElementById('i-z').value = state.selected.__s.z;
                    shadow.getElementById('i-z').oninput = (e) => { state.selected.__s.z = parseFloat(e.target.value); state.selected.__up(); };
                    shadow.getElementById('i-b').value = state.selected.__s.b;
                    shadow.getElementById('i-b').oninput = (e) => { state.selected.__s.b = e.target.value; state.selected.__up(); };
                }
            }
            refresh();
        } else {
            if (styleOverride) styleOverride.remove();
            hlH.style.opacity = hlS.style.opacity = '0';
            
            // Clean up all images on the page
            document.querySelectorAll('img').forEach(img => {
                const s = img.__s;
                img.classList.remove('editor-selected');
                
                // Clear inline style properties added by editor
                img.style.removeProperty('transform');
                img.style.removeProperty('object-position');
                img.style.removeProperty('object-fit');
                img.style.removeProperty('filter');
                img.style.removeProperty('transition');
                img.style.removeProperty('cursor');
                
                if (s) {
                    const isModified = (s.z !== 1 || s.dx !== 0 || s.dy !== 0 || s.b !== 100);
                    if (isModified) {
                        img.style.transform = `scale(${s.z})`;
                        img.style.objectPosition = `${formatCalc(s.dx)} ${formatCalc(s.dy)}`;
                        img.style.objectFit = 'cover';
                        if (s.b !== 100) {
                            img.style.filter = `brightness(${s.b}%)`;
                        }
                    }
                }
                
                // Remove empty style attribute if it has no styles left
                if (img.style.length === 0) {
                    img.removeAttribute('style');
                }
            });
            
            if (state.selected) {
                state.selected.contentEditable = 'false';
                state.selected.style.removeProperty('transition');
                state.selected.classList.remove('editor-selected');
                state.selected = null;
            }
            document.querySelectorAll('.editor-selected').forEach(x => x.classList.remove('editor-selected'));
        }
    };

    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'v' && !['INPUT','TEXTAREA'].includes(e.target.tagName)) {
            toggleActive(!state.active);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!state.active || root.contains(e.target)) { hlH.style.opacity = '0'; return; }
        if (state.hovered === e.target && hlH.style.opacity === '1') return;
        state.hovered = e.target; 
        updateHl(hlH, e.target);
    });

    shadow.getElementById('i-v').oninput = (e) => { if (state.selected) state.selected.innerText = e.target.value; refresh(); };
    const bind = (id, prop, unit = '') => {
        shadow.getElementById(id).oninput = (e) => {
            if (!state.selected) return;
            let v = e.target.value;
            if (prop === 'fontSize') v = toResponsive(parseFloat(v));
            else if (unit) v += unit;
            state.selected.style[prop] = v;
            refresh();
        };
    };
    bind('i-fs', 'fontSize'); bind('i-lh', 'lineHeight');
    bind('i-mg', 'margin', 'px'); bind('i-pd', 'padding', 'px'); bind('i-br', 'borderRadius', 'px');

    function setupImg(img) {
        if (img.naturalWidth === 0) {
            img.addEventListener('load', () => {
                img.__rect = null; // Clear cached dimensions when fully loaded
                setupImg(img);
            }, { once: true });
            return;
        }

        // Parse initial zoom and offset state from CSS
        let initialZ = 1;
        let initialDx = 0;
        let initialDy = 0;
        
        const transformStr = img.style.transform;
        if (transformStr) {
            const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
            if (scaleMatch) initialZ = parseFloat(scaleMatch[1]) || 1;
        }
        
        const cleanVal = (str) => {
            let s = str.replace(/\s+/g, '');
            s = s.replace(/\+-/g, '-').replace(/-\+/g, '-').replace(/\+\+/g, '+');
            return parseFloat(s) || 0;
        };

        const objPosStr = img.style.objectPosition;
        if (objPosStr) {
            const matches = [...objPosStr.matchAll(/calc\(50%\s*([+-]\s*[-+]?\d+(?:\.\d+)?)\s*px\)/g)];
            if (matches.length >= 1) {
                initialDx = cleanVal(matches[0][1]);
            }
            if (matches.length >= 2) {
                initialDy = cleanVal(matches[1][1]);
            }
        }

        const s = img.__s || { z: initialZ, dx: initialDx, dy: initialDy, b: 100 };
        img.__s = s;
        
        img.style.setProperty('object-fit', 'cover', 'important');
        img.style.setProperty('cursor', 'move', 'important');
        img.style.setProperty('transition', 'none', 'important');
        
        const up = () => {
            // Apply scale with !important
            img.style.setProperty('transform', `scale(${s.z})`, 'important');
            img.style.setProperty('transition', 'none', 'important');
            img.style.setProperty('filter', s.b !== 100 ? `brightness(${s.b}%)` : 'none', 'important');
            
            // Calculate parent boundaries & clamp offsets to prevent black margins
            if (!img.__rect) {
                const containerRect = img.parentElement.getBoundingClientRect();
                img.__rect = {
                    Wc: containerRect.width,
                    Hc: containerRect.height,
                    Wnat: img.naturalWidth,
                    Hnat: img.naturalHeight
                };
            }
            const { Wc, Hc, Wnat, Hnat } = img.__rect;
            
            if (Wc && Hc && Wnat && Hnat) {
                const AR = Wnat / Hnat;
                const z = s.z;
                let maxDx = 0;
                let maxDy = 0;
                
                if (AR > Wc / Hc) {
                    // Wide aspect ratio
                    maxDx = (Hc * AR) / 2 - Wc / (2 * z);
                    maxDy = (Hc / 2) * (1 - 1 / z);
                } else {
                    // Tall aspect ratio
                    maxDx = (Wc / 2) * (1 - 1 / z);
                    maxDy = Wc / (2 * AR) - Hc / (2 * z);
                }
                
                // Clamp coordinates
                s.dx = Math.max(-maxDx, Math.min(maxDx, s.dx));
                s.dy = Math.max(-maxDy, Math.min(maxDy, s.dy));
            }
            
            img.style.setProperty('object-position', `${formatCalc(s.dx)} ${formatCalc(s.dy)}`, 'important');
        };
        
        img.__up = up;
        up();
        
        // Check for brightness filter
        const filterStr = img.style.filter;
        if (filterStr) {
            const brightMatch = filterStr.match(/brightness\((\d+)%\)/);
            if (brightMatch) s.b = parseInt(brightMatch[1]);
        }
        
        if (state.selected === img) {
            shadow.getElementById('i-z').value = s.z;
            shadow.getElementById('i-b').value = s.b;
        }
        
        if (!img.__setup) {
            img.__setup = true;
            
            // Prevent OS ghosting during drags
            img.addEventListener('dragstart', (e) => e.preventDefault());
            
            img.onwheel = (e) => {
                if (!state.active || state.selected !== img) return;
                e.preventDefault();
                s.z = Math.max(1, s.z * (e.deltaY > 0 ? 0.94 : 1.06));
                s.z = Math.min(8, s.z);
                if (state.selected === img) {
                    shadow.getElementById('i-z').value = s.z;
                }
                up();
            };
            
            let dr = false;
            let l = { x: 0, y: 0 };
            
            const dn = (e) => {
                if (!state.active || state.selected !== img) return;
                dr = true;
                img.__rect = null; // Clear dimension cache to measure accurately on drag start
                l = { x: e.clientX, y: e.clientY };
                e.preventDefault();
                e.stopPropagation();
            };
            
            img.__dragStart = dn;
            
            const mv = (e) => {
                if (!dr) return;
                // Move pixels divided by zoom keeps drag 1:1 on-screen
                s.dx += (e.clientX - l.x) / s.z;
                s.dy += (e.clientY - l.y) / s.z;
                up();
                l = { x: e.clientX, y: e.clientY };
            };
            
            const st = () => {
                dr = false;
            };
            
            img.addEventListener('mousedown', dn);
            window.addEventListener('mousemove', mv);
            window.addEventListener('mouseup', st);
        }
    }

    // File Upload Wiring
    const fileInput = shadow.getElementById('i-file');
    const fileBtn = shadow.getElementById('i-file-btn');
    fileBtn.onclick = () => fileInput.click();
    
    // Reset layout button listener
    const resetBtn = shadow.getElementById('i-reset-btn');
    resetBtn.onclick = () => {
        if (!state.selected || state.selected.tagName !== 'IMG') return;
        const img = state.selected;
        img.__rect = null; // Clear cached dimensions
        const s = { z: 1, dx: 0, dy: 0, b: 100 };
        img.__s = s;
        
        img.style.setProperty('transform', 'scale(1)', 'important');
        img.style.setProperty('object-position', '50% 50%', 'important');
        img.style.setProperty('transition', 'none', 'important');
        img.style.setProperty('filter', 'none', 'important');
        
        shadow.getElementById('i-z').value = 1;
        shadow.getElementById('i-b').value = 100;
        
        setupImg(img);
        refresh();
    };

    async function uploadImage(file) {
        if (!file || !state.selected || state.selected.tagName !== 'IMG') return;
        
        fileBtn.innerText = 'Uploading...';
        const formData = new FormData();
        // Append text fields FIRST so multer processes them before the file
        formData.append('project', getProjectName());
        formData.append('folder', 'img');
        formData.append('image', file);
        
        try {
            const res = await fetch(`${CONFIG.serverUrl}/api/upload-image`, {
                method: 'POST',
                body: formData
            });
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonErr) {
                throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
            }
            
            if (data.success) {
                state.selected.src = data.url;
                state.selected.__rect = null; // Clear cached dimensions for new image
                
                // Reset parameters for new image
                const s = { z: 1, dx: 0, dy: 0, b: 100 };
                state.selected.__s = s;
                
                state.selected.style.setProperty('transform', 'scale(1)', 'important');
                state.selected.style.setProperty('object-position', '50% 50%', 'important');
                state.selected.style.setProperty('transition', 'none', 'important');
                state.selected.style.setProperty('filter', 'none', 'important');
                
                shadow.getElementById('i-z').value = 1;
                shadow.getElementById('i-b').value = 100;
                
                setupImg(state.selected);
                refresh();
            } else {
                alert('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Upload error: ' + err.message);
        } finally {
            fileBtn.innerHTML = `
                <svg style="width:12px;height:12px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                Upload Image
            `;
            fileInput.value = '';
        }
    }

    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) await uploadImage(file);
    };

    // Paste handler for Ctrl+V image replace
    document.addEventListener('paste', async (e) => {
        if (!state.active || !state.selected || state.selected.tagName !== 'IMG') return;
        
        const activeEl = shadow.activeElement || document.activeElement;
        if (activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) {
            return;
        }
        
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let fileFound = false;
        for (let item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    e.preventDefault();
                    await uploadImage(file);
                    fileFound = true;
                    break;
                }
            }
        }
        
        if (!fileFound) {
            const text = e.clipboardData.getData('text');
            if (text && (text.trim().startsWith('http://') || text.trim().startsWith('https://') || text.trim().startsWith('data:image/'))) {
                e.preventDefault();
                state.selected.src = text.trim();
                state.selected.__rect = null; // Clear cached dimensions for new image
                
                // Reset parameters for new image
                const s = { z: 1, dx: 0, dy: 0, b: 100 };
                state.selected.__s = s;
                
                state.selected.style.setProperty('transform', 'scale(1)', 'important');
                state.selected.style.setProperty('object-position', '50% 50%', 'important');
                state.selected.style.setProperty('transition', 'none', 'important');
                state.selected.style.setProperty('filter', 'none', 'important');
                
                shadow.getElementById('i-z').value = 1;
                shadow.getElementById('i-b').value = 100;
                
                setupImg(state.selected);
                refresh();
            }
        }
    });

    function switchTab(id) {
        shadow.querySelectorAll('.tab, .section').forEach(x => x.classList.remove('active'));
        shadow.querySelector(`[data-tab="${id}"]`).classList.add('active'); shadow.getElementById(id).classList.add('active');
        if (id === 'p') scanP();
    }
    shadow.querySelectorAll('.tab').forEach(t => t.onclick = () => switchTab(t.dataset.tab));

    function scanP() {
        const l = shadow.getElementById('p-l'); l.innerHTML = '';
        const palettes = {
            noir: { name: 'Noir', bg: '#0a0a0a', surface: '#141414', text: '#f5f5f5', muted: '#999999', accent: '#e0c687', border: '#2a2a2a', overlay: 'rgba(0, 0, 0, 0.6)' },
            ivory: { name: 'Ivory', bg: '#faf8f5', surface: '#f0ece6', text: '#1a1a1a', muted: '#666666', accent: '#8b6914', border: '#e0dcd6', overlay: 'rgba(0, 0, 0, 0.5)' },
            blush: { name: 'Blush', bg: '#fdf5f3', surface: '#f9ebe7', text: '#2d1f1a', muted: '#7a5a50', accent: '#c47a6c', border: '#e8d5d0', overlay: 'rgba(45, 31, 26, 0.5)' },
            burgundy: { name: 'Burgundy', bg: '#1a0a0f', surface: '#2a1520', text: '#f5e6ea', muted: '#b08a94', accent: '#d4a0a0', border: '#3d2530', overlay: 'rgba(26, 10, 15, 0.6)' },
            onyx: { name: 'Onyx', bg: '#121212', surface: '#1e1e1e', text: '#e8e8e8', muted: '#888888', accent: '#ffffff', border: '#333333', overlay: 'rgba(0, 0, 0, 0.65)' },
            ink: { name: 'Ink', bg: '#0d1117', surface: '#161b22', text: '#e6edf3', muted: '#7d8590', accent: '#a8c5da', border: '#21262d', overlay: 'rgba(13, 17, 23, 0.6)' },
            contrast: { name: 'Contrast', bg: '#ffffff', surface: '#f6f6f6', text: '#000000', muted: '#555555', accent: '#000000', border: '#e0e0e0', overlay: 'rgba(0, 0, 0, 0.55)' },
            emerald: { name: 'Emerald', bg: '#071a13', surface: '#0d2d22', text: '#e6f0ec', muted: '#8fae9f', accent: '#d4af37', border: '#173e31', overlay: 'rgba(7, 26, 19, 0.65)' },
            midnight: { name: 'Midnight', bg: '#0b1325', surface: '#111d35', text: '#f0f4f8', muted: '#8ba0b5', accent: '#e5c158', border: '#1e2d4a', overlay: 'rgba(11, 19, 37, 0.65)' },
            sakura: { name: 'Sakura', bg: '#fff0f2', surface: '#ffd6db', text: '#3d1a21', muted: '#8f5863', accent: '#d6336c', border: '#ffb3bd', overlay: 'rgba(61, 26, 33, 0.5)' },
            espresso: { name: 'Espresso', bg: '#1b120f', surface: '#2b1d18', text: '#f7f3f0', muted: '#bfae9e', accent: '#dfb15b', border: '#3d2c25', overlay: 'rgba(27, 18, 15, 0.65)' },
            lavender: { name: 'Lavender', bg: '#f4f0fa', surface: '#e8dffd', text: '#201530', muted: '#6e5d8f', accent: '#7048e8', border: '#d3c2fa', overlay: 'rgba(32, 21, 48, 0.5)' },
            olive: { name: 'Olive', bg: '#f4f5f0', surface: '#e6e8db', text: '#242b1f', muted: '#66705d', accent: '#708060', border: '#d2d4c3', overlay: 'rgba(36, 43, 31, 0.5)' },
            copper: { name: 'Copper', bg: '#16110e', surface: '#261e1a', text: '#f7f0eb', muted: '#bda596', accent: '#e07a5f', border: '#3c2e28', overlay: 'rgba(22, 17, 14, 0.65)' },
            platinum: { name: 'Platinum', bg: '#f8f9fa', surface: '#e9ecef', text: '#212529', muted: '#6c757d', accent: '#495057', border: '#dee2e6', overlay: 'rgba(33, 37, 41, 0.5)' },
            terracotta: { name: 'Terracotta', bg: '#fdf6f0', surface: '#f7e5d5', text: '#3d1d11', muted: '#8c5c48', accent: '#d96a3f', border: '#edd1ba', overlay: 'rgba(61, 29, 17, 0.5)' },
            ocean: { name: 'Ocean', bg: '#051f20', surface: '#0b3c3d', text: '#e6f7f7', muted: '#8abfb0', accent: '#24a19c', border: '#155e5f', overlay: 'rgba(5, 31, 32, 0.65)' },
            aura: { name: 'Aura', bg: '#07050f', surface: '#15102a', text: '#f2f0fa', muted: '#9c94c0', accent: '#a64eff', border: '#2c2354', overlay: 'rgba(7, 5, 15, 0.65)' }
        };
        
        const container = document.createElement('div');
        container.className = 'p-grid';
        
        Object.entries(palettes).forEach(([id, p]) => {
            const item = document.createElement('div');
            item.className = 'p-item';
            
            const currentPalette = document.documentElement.getAttribute('data-palette') || 'noir';
            const isSelected = currentPalette === id;
            if (isSelected) {
                item.style.borderColor = '#00f2fe';
                item.style.boxShadow = '0 0 10px rgba(0, 242, 254, 0.15)';
                item.style.background = 'rgba(0, 242, 254, 0.03)';
            }
            
            item.innerHTML = `
                <span>${p.name.toUpperCase()}</span>
                <div class="p-preview">
                    <div class="p-color" style="background:${p.bg}" title="Background"></div>
                    <div class="p-color" style="background:${p.surface}" title="Surface"></div>
                    <div class="p-color" style="background:${p.text}" title="Text"></div>
                    <div class="p-color" style="background:${p.muted}" title="Muted"></div>
                    <div class="p-color" style="background:${p.accent}" title="Accent"></div>
                    <div class="p-color" style="background:${p.border}" title="Border"></div>
                </div>
            `;
            item.onclick = () => {
                document.documentElement.setAttribute('data-palette', id);
                localStorage.setItem('beautyMama_palette', id);
                document.querySelectorAll('.palette-switcher__btn').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-palette') === id);
                });
                scanP();
            };
            container.appendChild(item);
        });
        l.appendChild(container);
    }

    shadow.getElementById('f-btn').onclick = () => panel.classList.toggle('collapsed');
    shadow.getElementById('c-btn').onclick = () => { toggleActive(false); };
    
    const applyPBtn = shadow.getElementById('apply-p-btn');
    if (applyPBtn) {
        applyPBtn.onclick = async () => {
            const btn = applyPBtn;
            const originalText = btn.innerText;
            btn.innerText = 'Applying...';
            
            const currentPalette = document.documentElement.getAttribute('data-palette') || 'noir';
            
            const palettes = {
                noir: { name: 'Noir', bg: '#0a0a0a', surface: '#141414', text: '#f5f5f5', muted: '#999999', accent: '#e0c687', border: '#2a2a2a', overlay: 'rgba(0, 0, 0, 0.6)' },
                ivory: { name: 'Ivory', bg: '#faf8f5', surface: '#f0ece6', text: '#1a1a1a', muted: '#666666', accent: '#8b6914', border: '#e0dcd6', overlay: 'rgba(0, 0, 0, 0.5)' },
                blush: { name: 'Blush', bg: '#fdf5f3', surface: '#f9ebe7', text: '#2d1f1a', muted: '#7a5a50', accent: '#c47a6c', border: '#e8d5d0', overlay: 'rgba(45, 31, 26, 0.5)' },
                burgundy: { name: 'Burgundy', bg: '#1a0a0f', surface: '#2a1520', text: '#f5e6ea', muted: '#b08a94', accent: '#d4a0a0', border: '#3d2530', overlay: 'rgba(26, 10, 15, 0.6)' },
                onyx: { name: 'Onyx', bg: '#121212', surface: '#1e1e1e', text: '#e8e8e8', muted: '#888888', accent: '#ffffff', border: '#333333', overlay: 'rgba(0, 0, 0, 0.65)' },
                ink: { name: 'Ink', bg: '#0d1117', surface: '#161b22', text: '#e6edf3', muted: '#7d8590', accent: '#a8c5da', border: '#21262d', overlay: 'rgba(13, 17, 23, 0.6)' },
                contrast: { name: 'Contrast', bg: '#ffffff', surface: '#f6f6f6', text: '#000000', muted: '#555555', accent: '#000000', border: '#e0e0e0', overlay: 'rgba(0, 0, 0, 0.55)' },
                emerald: { name: 'Emerald', bg: '#071a13', surface: '#0d2d22', text: '#e6f0ec', muted: '#8fae9f', accent: '#d4af37', border: '#173e31', overlay: 'rgba(7, 26, 19, 0.65)' },
                midnight: { name: 'Midnight', bg: '#0b1325', surface: '#111d35', text: '#f0f4f8', muted: '#8ba0b5', accent: '#e5c158', border: '#1e2d4a', overlay: 'rgba(11, 19, 37, 0.65)' },
                sakura: { name: 'Sakura', bg: '#fff0f2', surface: '#ffd6db', text: '#3d1a21', muted: '#8f5863', accent: '#d6336c', border: '#ffb3bd', overlay: 'rgba(61, 26, 33, 0.5)' },
                espresso: { name: 'Espresso', bg: '#1b120f', surface: '#2b1d18', text: '#f7f3f0', muted: '#bfae9e', accent: '#dfb15b', border: '#3d2c25', overlay: 'rgba(27, 18, 15, 0.65)' },
                lavender: { name: 'Lavender', bg: '#f4f0fa', surface: '#e8dffd', text: '#201530', muted: '#6e5d8f', accent: '#7048e8', border: '#d3c2fa', overlay: 'rgba(32, 21, 48, 0.5)' },
                olive: { name: 'Olive', bg: '#f4f5f0', surface: '#e6e8db', text: '#242b1f', muted: '#66705d', accent: '#708060', border: '#d2d4c3', overlay: 'rgba(36, 43, 31, 0.5)' },
                copper: { name: 'Copper', bg: '#16110e', surface: '#261e1a', text: '#f7f0eb', muted: '#bda596', accent: '#e07a5f', border: '#3c2e28', overlay: 'rgba(22, 17, 14, 0.65)' },
                platinum: { name: 'Platinum', bg: '#f8f9fa', surface: '#e9ecef', text: '#212529', muted: '#6c757d', accent: '#495057', border: '#dee2e6', overlay: 'rgba(33, 37, 41, 0.5)' },
                terracotta: { name: 'Terracotta', bg: '#fdf6f0', surface: '#f7e5d5', text: '#3d1d11', muted: '#8c5c48', accent: '#d96a3f', border: '#edd1ba', overlay: 'rgba(61, 29, 17, 0.5)' },
                ocean: { name: 'Ocean', bg: '#051f20', surface: '#0b3c3d', text: '#e6f7f7', muted: '#8abfb0', accent: '#24a19c', border: '#155e5f', overlay: 'rgba(5, 31, 32, 0.65)' },
                aura: { name: 'Aura', bg: '#07050f', surface: '#15102a', text: '#f2f0fa', muted: '#9c94c0', accent: '#a64eff', border: '#2c2354', overlay: 'rgba(7, 5, 15, 0.65)' }
            };
            
            const p = palettes[currentPalette];
            if (!p) {
                btn.innerText = 'Error';
                setTimeout(() => btn.innerText = originalText, 2000);
                return;
            }
            
            try {
                const res = await fetch('css/styles.css');
                const cssText = await res.text();
                
                const colorsStart = '/* Palette Colors Start */';
                const colorsEnd = '/* Palette Colors End */';
                
                if (cssText.includes(colorsStart) && cssText.includes(colorsEnd)) {
                    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(escapeRegExp(colorsStart) + '[\\s\\S]*?' + escapeRegExp(colorsEnd));
                    const newColorsBlock = `${colorsStart}
  --color-bg: ${p.bg};
  --color-surface: ${p.surface};
  --color-text: ${p.text};
  --color-text-muted: ${p.muted};
  --color-accent: ${p.accent};
  --color-border: ${p.border};
  --color-overlay: ${p.overlay};
  ${colorsEnd}`;
                    const updatedCss = cssText.replace(regex, newColorsBlock);
                    
                    const saveRes = await fetch(`${CONFIG.serverUrl}/api/save-css`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            project: getProjectName(),
                            filePath: 'css/styles.css',
                            content: updatedCss
                        })
                    });
                    const saveData = await saveRes.json();
                    if (saveData.success) {
                        btn.innerText = 'Applied!';
                    } else {
                        btn.innerText = 'Failed';
                    }
                } else {
                    btn.innerText = 'No Placeholder';
                }
            } catch (err) {
                console.error(err);
                btn.innerText = 'Error';
            }
            setTimeout(() => btn.innerText = originalText, 2000);
        };
    }
        shadow.getElementById('save').onclick = async () => {
        const b = shadow.getElementById('save'); b.innerText = 'Syncing...';
        
        let styleOverride = document.getElementById('editor-style-override');
        if (styleOverride) styleOverride.remove();
        root.remove();
        
        // Save the current states of images so we can restore them afterwards
        const savedStyles = [];
        document.querySelectorAll('img').forEach(img => {
            savedStyles.push({
                img: img,
                transform: img.style.transform,
                objectPosition: img.style.objectPosition,
                objectFit: img.style.objectFit,
                filter: img.style.filter,
                transition: img.style.transition,
                cursor: img.style.cursor,
                className: img.className
            });
            
            const s = img.__s;
            const isModified = s && (s.z !== 1 || s.dx !== 0 || s.dy !== 0 || s.b !== 100);
            
            // Clean up properties for saving (strip !important, remove editing helpers)
            img.style.removeProperty('transform');
            img.style.removeProperty('object-position');
            img.style.removeProperty('object-fit');
            img.style.removeProperty('filter');
            img.style.removeProperty('transition');
            img.style.removeProperty('cursor');
            img.classList.remove('editor-selected');
            
            if (isModified) {
                // Keep the values but without !important
                img.style.transform = `scale(${s.z})`;
                img.style.objectPosition = `${formatCalc(s.dx)} ${formatCalc(s.dy)}`;
                img.style.objectFit = 'cover';
                if (s.b !== 100) {
                    img.style.filter = `brightness(${s.b}%)`;
                }
            }
            
            // Remove empty style attribute if it has no styles left
            if (img.style.length === 0) {
                img.removeAttribute('style');
            }
        });
        
        const selected = state.selected;
        let selectedTransition = '';
        let selectedContentEditable = '';
        if (selected) {
            selectedTransition = selected.style.transition;
            selectedContentEditable = selected.contentEditable;
            
            selected.contentEditable = 'false';
            selected.style.removeProperty('transition');
            selected.classList.remove('editor-selected');
        }
        
        // Capture HTML representation of clean DOM
        const h = document.documentElement.outerHTML;
        
        // Re-append root container
        document.body.appendChild(root);
        
        // Restore style overrides stylesheet if editor is active
        if (state.active && styleOverride) {
            document.head.appendChild(styleOverride);
        }
        
        // Restore original inline styles (with !important) and helper classes to on-screen DOM
        savedStyles.forEach(item => {
            const img = item.img;
            if (item.transform) img.style.setProperty('transform', item.transform, 'important');
            if (item.objectPosition) img.style.setProperty('object-position', item.objectPosition, 'important');
            if (item.objectFit) img.style.setProperty('object-fit', item.objectFit, 'important');
            if (item.filter) img.style.setProperty('filter', item.filter, 'important');
            if (state.active) {
                if (item.transition) img.style.setProperty('transition', item.transition, 'important');
                if (item.cursor) img.style.setProperty('cursor', item.cursor, 'important');
                if (item.className.includes('editor-selected')) img.classList.add('editor-selected');
            }
        });
        
        if (state.active && selected) {
            selected.classList.add('editor-selected');
            if (selectedContentEditable === 'true') {
                selected.contentEditable = 'true';
            }
            if (selected.tagName === 'IMG') {
                selected.style.setProperty('transition', 'none', 'important');
                selected.style.setProperty('cursor', 'move', 'important');
            } else {
                selected.style.setProperty('transition', 'none', 'important');
            }
        }
        
        await fetch(`${CONFIG.serverUrl}/api/save-html`, { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ project: getProjectName(), filePath: 'index.html', content: h }) 
        });
        b.innerText = 'Success'; setTimeout(() => b.innerText='Push Updates', 2000);
    };
 
    panel.querySelector('.header').onmousedown = (e) => {
        if (e.target.closest('.win-btn')) return;
        let o = {x: e.clientX - panel.offsetLeft, y: e.clientY - panel.offsetTop};
        const m = (ev) => { panel.style.left = (ev.clientX-o.x)+'px'; panel.style.top = (ev.clientY-o.y)+'px'; };
        window.addEventListener('mousemove', m);
        window.addEventListener('mouseup', () => {
            window.removeEventListener('mousemove', m);
            localStorage.setItem('editor-panel-pos', JSON.stringify({
                top: parseInt(panel.style.top),
                left: parseInt(panel.style.left)
            }));
        }, {once:true});
    };
})();;
