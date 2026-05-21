(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{constructor(e){this.parent=e}getHTML(e=!1){return`
            <header class="bank_header">
                <div style="display: flex; align-items: center;">
                    ${e?`<button id="back-btn" class="sys_btn" style="border-color: var(--t-yellow); color: var(--t-yellow); font-size: 1.2rem; padding: 10px 25px; border-width: 2px;">← Назад</button>`:`<div class="bank_logo" id="logo_home">
                   <span class="logo_icon">V</span>
                   <span class="logo_text">ATM</span>
               </div>`}
                </div>
                <div class="header_controls">
                    <button id="trigger_theme" class="sys_btn">Сменить тему</button>
                </div>
            </header>
        `}initThemeSwitcher(){document.getElementById(`trigger_theme`).addEventListener(`click`,()=>{document.body.classList.toggle(`light_theme`)})}render(e=!1,t=null){this.parent.insertAdjacentHTML(`beforeend`,this.getHTML(e)),this.initThemeSwitcher(),e&&t&&document.getElementById(`back-btn`).addEventListener(`click`,t)}},t=class{constructor(e,t,n){this.parent=e,this.data=t,this.onBack=n,this.denominations={RUB:[5e3,2e3,1e3,500,200,100],USD:[100,50,20,10],EUR:[500,200,100,50,20,10],CNY:[100,50,20,10],GBP:[50,20,10,5]}}getMinDenomination(){let e=this.denominations[this.data.currency];return e[e.length-1]}renderDenominationTags(){return this.denominations[this.data.currency].map(e=>`<span style="background: rgba(255,221,45,0.1); color: var(--t-yellow); padding: 5px 12px; border-radius: 6px; font-weight: bold; border: 1px solid rgba(255,221,45,0.3); font-size: 0.9rem;">${e}</span>`).join(` `)}getHTML(){let e=this.getMinDenomination(),t=this.renderDenominationTags();return`
            <div id="header-container"></div>
            <main class="main_content">
                <div class="full_width">
                    <img src="${this.data.src}" class="detail_hero_img" alt="${this.data.title}">

                    <div class="terminal_layout">
                        <div class="terminal_info">
                            <h2>Операция выдачи: ${this.data.title}</h2>
                            <p style="margin-bottom: 25px;">Подтвердите сумму. Данные в банковском хранилище будут обновлены автоматически.</p>

                            <div style="background: var(--t-dark-bg); padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid var(--t-yellow);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                    <span style="color: var(--t-text-muted);">Доступно в хранилище:</span>
                                    <span style="font-size: 1.2rem; color: var(--t-text-main);"><b id="reserve-display">${this.data.reserve} ${this.data.symbol}</b></span>
                                </div>
                                <div>
                                    <span style="color: var(--t-text-muted); display: block; margin-bottom: 8px;">Номиналы в кассете:</span>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                        ${t}
                                    </div>
                                </div>
                            </div>

                            <div id="error-msg" class="error_msg"></div>

                            <label style="display: block; margin-bottom: 10px; color: var(--t-text-muted);">
                                Укажите сумму (кратно ${e} ${this.data.symbol}):
                            </label>

                            <div class="input_wrapper">
                                <button class="input_btn" id="btn-minus" type="button">−</button>
                                <input type="number" id="withdraw-amount" value="${e*10}" step="${e}">
                                <button class="input_btn" id="btn-plus" type="button">+</button>
                            </div>

                            <button id="calc-btn" class="action_link_btn" type="button">Подтвердить и выдать</button>

                            <div id="algo-result" class="receipt_box"></div>
                        </div>
                    </div>
                </div>
            </main>

            <footer class="atm_footer_signature">
                &copy; 2026 V ATM
            </footer>
        `}setupInputControls(){let e=document.getElementById(`withdraw-amount`),t=document.getElementById(`btn-minus`),n=document.getElementById(`btn-plus`),r=this.getMinDenomination();t.onclick=()=>{let t=parseInt(e.value)||0;t>=r*2&&(e.value=t-r)},n.onclick=()=>{e.value=(parseInt(e.value)||0)+r}}async calculateDispense(e){e&&e.preventDefault();let t=document.getElementById(`withdraw-amount`),n=document.getElementById(`algo-result`),r=document.getElementById(`error-msg`),i=document.getElementById(`reserve-display`),a=parseInt(t.value),o=this.getMinDenomination();if(n.style.display=`none`,r.style.display=`none`,!a||a<=0){r.innerText=`⚠️ Введите сумму больше нуля.`,r.style.display=`block`;return}if(a%o!==0){r.innerText=`⚠️ Сумма должна быть кратна ${o} ${this.data.symbol}.`,r.style.display=`block`;return}try{let e=await fetch(`http://localhost:3000/api/currencies/${this.data.id}`,{method:`PATCH`,headers:{"Content-Type":`application/json`},body:JSON.stringify({amount:a})}),t=await e.json();if(!e.ok){r.innerText=`⚠️ ${t.error}`,r.style.display=`block`;return}this.data.reserve=t.reserve,i.innerText=`${this.data.reserve} ${this.data.symbol}`;let o=this.denominations[this.data.currency],s={},c=0,l=a;for(;l>0&&c<o.length;){let e=o[c];l>=e?(s[e]||(s[e]=0),s[e]++,l-=e):c++}let u=`<div class="receipt_header">Транзакция выполнена</div>`;for(let e in s)u+=`
                    <div class="receipt_row">
                        <span>Купюра ${e} ${this.data.symbol}</span>
                        <span>${s[e]} шт.</span>
                    </div>
                `;u+=`
                <div class="receipt_total">
                    <span>ВЫДАНО:</span>
                    <span>${a} ${this.data.symbol}</span>
                </div>
            `,n.innerHTML=u,n.style.display=`block`}catch{r.innerText=`⚠️ Ошибка связи с сервером. Проверьте backend.`,r.style.display=`block`}}render(){this.parent.innerHTML=this.getHTML(),new e(document.getElementById(`header-container`)).render(!0,this.onBack),this.setupInputControls();let t=document.getElementById(`calc-btn`);t.onclick=async e=>{console.log(`Кнопка нажата, запускаю расчет...`),await this.calculateDispense(e)}}async calculateDispense(e){e&&e.preventDefault();let t=document.getElementById(`withdraw-amount`),n=document.getElementById(`algo-result`),r=document.getElementById(`error-msg`),i=document.getElementById(`reserve-display`),a=parseInt(t.value),o=this.getMinDenomination();if(n.style.display=`none`,r.style.display=`none`,!a||a<=0){r.innerText=`⚠️ Введите сумму больше нуля.`,r.style.display=`block`;return}if(a%o!==0){r.innerText=`⚠️ Сумма должна быть кратна ${o} ${this.data.symbol}. В кассете нет купюр меньше этого номинала.`,r.style.display=`block`;return}try{let e=await fetch(`http://localhost:3000/api/currencies/${this.data.id}`,{method:`PATCH`,headers:{"Content-Type":`application/json`},body:JSON.stringify({amount:a})}),t=await e.json();if(!e.ok){r.innerText=`⚠️ ${t.error}`,r.style.display=`block`;return}this.data.reserve=t.reserve,i.innerText=`${this.data.reserve} ${this.data.symbol}`;let o=this.denominations[this.data.currency],s={},c=0,l=a;for(;l>0&&c<o.length;){let e=o[c];l>=e?(s[e]||(s[e]=0),s[e]++,l-=e):c++}let u=`<div class="receipt_header">Транзакция выполнена</div>`;for(let e in s)u+=`<div class="receipt_row"><span>Купюра ${e} ${this.data.symbol}</span><span>${s[e]} шт.</span></div>`;u+=`<div class="receipt_total"><span>ВЫДАНО:</span><span>${a} ${this.data.symbol}</span></div>`,n.innerHTML=u,n.style.display=`block`}catch{r.innerText=`⚠️ Ошибка сервера. Проверь бэкенд.`,r.style.display=`block`}}},n=class{constructor(e){this.parent=e,this.data=[],this.deleteTargetId=null}getHTML(){return`
            <div id="header-container"></div>
            <main class="main_content">
                <div class="full_width">
                    <div class="hero_intro">
                        <div class="hero_intro_text">
                            <h1 style="color: var(--t-yellow);">Модуль кассовых операций</h1>
                            <p>Защищенный интерфейс управления валютными резервами V ATM. Система обеспечивает прямой доступ к физическим кассетам банкомата.</p>
                        </div>
                    </div>

                    <div style="text-align: center; margin: 40px 0;">
                        <button id="btn_open_add_modal" class="action_link_btn" style="max-width: 350px; font-size: 1.2rem; padding: 18px 40px; box-shadow: 0 0 20px rgba(255, 221, 45, 0.2);">
                          ➕ Добавить новую кассету
                        </button>
                    </div>

                    <h2 style="color: var(--t-text-main); margin-bottom: 25px;">Валютные кассеты</h2>
                    <div id="status_message" style="margin-bottom: 20px;"></div>
                    <div id="cards-container" class="currency_grid"></div>
                </div>
            </main>

            <div id="crud_modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center;">
                <div style="background: var(--t-card-bg); padding: 30px; border-radius: 16px; width: 420px; border: 1px solid var(--t-yellow); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                  <h3 id="modal_title" style="color: var(--t-yellow); margin-top: 0; font-size: 1.4rem;">Управление кассетой</h3>
                  <div id="modal_error" style="display: none; color: #ff3b30; background: rgba(255,59,48,0.1); padding: 10px; border-radius: 8px; margin-bottom: 15px; font-weight: 500; font-size: 0.9rem;"></div>

                  <form id="crud_form">
                    <input type="hidden" id="edit_id">
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Код валюты (например: USD):</label><input type="text" id="input_currency" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Символ ($ или ₽):</label><input type="text" id="input_symbol" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Название кассеты:</label><input type="text" id="input_title" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Количество купюр (Резерв):</label><input type="number" id="input_reserve" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Описание технологии:</label><input type="text" id="input_desc" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 20px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Ссылка на фоновое изображение:</label><input type="url" id="input_src" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>

                    <div style="display: flex; gap: 10px;">
                      <button type="submit" style="flex: 1; background: var(--t-yellow); color: #000; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Сохранить кассету</button>
                      <button type="button" id="btn_close_modal" style="flex: 1; background: #333; color: #fff; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">Отмена</button>
                    </div>
                  </form>
                </div>
            </div>

            <div id="confirm_modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center;">
                <div style="background: var(--t-card-bg); padding: 30px; border-radius: 16px; width: 350px; border: 1px solid #ff3b30; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;">
                  <h3 style="color: #ff3b30; margin-top: 0; font-size: 1.4rem;">Внимание!</h3>
                  <p style="color: var(--t-text-main); margin-bottom: 25px;">Точно изъять кассету? Это действие нельзя отменить.</p>
                  <div style="display: flex; gap: 10px;">
                    <button id="btn_confirm_delete" style="flex: 1; background: #ff3b30; color: #fff; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Удалить</button>
                    <button id="btn_cancel_delete" style="flex: 1; background: #333; color: #fff; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">Отмена</button>
                  </div>
                </div>
            </div>

            <footer class="atm_footer_signature">&copy; 2026 V ATM</footer>
        `}async loadData(){try{let e=await fetch(`http://localhost:3000/api/currencies`);if(!e.ok)throw Error(`Ошибка сервера`);this.data=await e.json(),document.getElementById(`status_message`).innerHTML=``,this.renderCards()}catch(e){console.error(`Ошибка загрузки данных:`,e),document.getElementById(`status_message`).innerHTML=`<p style='color:red;'>Ошибка связи с сервером!</p>`}}clickCard(e){let n=e.target.closest(`.currency_card`);if(!n)return;let r=parseInt(n.dataset.id),i=this.data.find(e=>e.id===r);new t(this.parent,i,this.render.bind(this)).render()}renderCards(){let e=document.getElementById(`cards-container`),t=``;this.data.forEach(e=>{t+=`
                <div class="currency_card" data-id="${e.id}" style="cursor: pointer; position: relative;">
                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 12px;">
                        <button class="crud-btn-edit" data-id="${e.id}" style="background: var(--t-yellow); border: none; border-radius: 6px; cursor: pointer; padding: 6px 10px; font-weight:bold;">✏️ Редактировать</button>
                        <button class="crud-btn-del" data-id="${e.id}" style="background: #ff3b30; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 10px; font-weight:bold;">✖ Удалить</button>
                    </div>
                    <img src="${e.src}" alt="${e.title}">
                    <h3 style="margin-bottom: 5px;">${e.title}</h3>
                    <p style="color: var(--t-yellow); font-weight: bold; margin-bottom: 10px;">Резерв: ${e.reserve} ${e.symbol}</p>
                    <p class="currency_desc">${e.desc||`Описание кассеты загружается...`}</p>
                    <button class="action_link_btn">Инициировать выдачу</button>
                </div>`}),e.innerHTML=t,e.querySelectorAll(`.currency_card`).forEach(e=>{e.addEventListener(`click`,e=>{!e.target.classList.contains(`crud-btn-edit`)&&!e.target.classList.contains(`crud-btn-del`)&&this.clickCard(e)})}),e.querySelectorAll(`.crud-btn-edit`).forEach(e=>{e.addEventListener(`click`,e=>this.openEditModal(parseInt(e.target.dataset.id)))}),e.querySelectorAll(`.crud-btn-del`).forEach(e=>{e.addEventListener(`click`,e=>this.openDeleteModal(parseInt(e.target.dataset.id)))})}openDeleteModal(e){this.deleteTargetId=e,document.getElementById(`confirm_modal`).style.display=`flex`}async confirmDelete(){if(this.deleteTargetId)try{await fetch(`http://localhost:3000/api/currencies/${this.deleteTargetId}`,{method:`DELETE`}),document.getElementById(`confirm_modal`).style.display=`none`,this.deleteTargetId=null,await this.loadData()}catch(e){console.error(`Ошибка удаления`,e)}}openEditModal(e){let t=this.data.find(t=>t.id===e);t&&(document.getElementById(`modal_title`).innerText=`✏️ Модификация кассеты`,document.getElementById(`edit_id`).value=t.id,document.getElementById(`input_currency`).value=t.currency,document.getElementById(`input_symbol`).value=t.symbol,document.getElementById(`input_title`).value=t.title,document.getElementById(`input_reserve`).value=t.reserve,document.getElementById(`input_desc`).value=t.desc,document.getElementById(`input_src`).value=t.src,document.getElementById(`modal_error`).style.display=`none`,document.getElementById(`crud_modal`).style.display=`flex`)}openAddModal(){document.getElementById(`crud_form`).reset(),document.getElementById(`edit_id`).value=``,document.getElementById(`modal_title`).innerText=`➕ Добавление новой кассеты`,document.getElementById(`modal_error`).style.display=`none`,document.getElementById(`crud_modal`).style.display=`flex`}async submitForm(e){e.preventDefault();let t=document.getElementById(`modal_error`),n=document.getElementById(`edit_id`).value,r={currency:document.getElementById(`input_currency`).value.trim(),symbol:document.getElementById(`input_symbol`).value.trim(),title:document.getElementById(`input_title`).value.trim(),reserve:parseInt(document.getElementById(`input_reserve`).value.trim()),desc:document.getElementById(`input_desc`).value.trim(),src:document.getElementById(`input_src`).value.trim()};if(!r.currency||!r.symbol||!r.title||isNaN(r.reserve)||!r.desc||!r.src){t.innerText=`❌ Пожалуйста, заполните все поля!`,t.style.display=`block`;return}try{n?await fetch(`http://localhost:3000/api/currencies/${n}`,{method:`PATCH`,headers:{"Content-Type":`application/json`},body:JSON.stringify(r)}):await fetch(`http://localhost:3000/api/currencies`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(r)}),document.getElementById(`crud_modal`).style.display=`none`,await this.loadData()}catch{t.innerText=`❌ Ошибка при сохранении!`,t.style.display=`block`}}setupModalListeners(){document.getElementById(`btn_open_add_modal`).addEventListener(`click`,()=>this.openAddModal()),document.getElementById(`btn_close_modal`).addEventListener(`click`,()=>document.getElementById(`crud_modal`).style.display=`none`),document.getElementById(`crud_form`).addEventListener(`submit`,e=>this.submitForm(e)),document.getElementById(`btn_cancel_delete`).addEventListener(`click`,()=>document.getElementById(`confirm_modal`).style.display=`none`),document.getElementById(`btn_confirm_delete`).addEventListener(`click`,()=>this.confirmDelete())}render(){this.parent.innerHTML=this.getHTML(),new e(document.getElementById(`header-container`)).render(!1),this.setupModalListeners(),this.loadData()}},r=document.getElementById(`root`);r?new n(r).render():console.error(`Элемент #root не найден в index.html!`);