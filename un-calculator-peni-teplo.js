/**
 * Калькулятор пени за услуги ЖКХ"(актуален на 2025 год).
 * URI:  https://kodabra.unchikov.ru/calculator-peni-155/
 * Author: Elena Unchikova
 * Version: 1.0.0
 * Author URI: https://kodabra.unchikov.ru/
 * Description:
 * Ставка для расчета пени в 2025 году - 9.5%.
 * Потребители коммунальных услуг должны оплачивать услугу ежемесячно до 10 числа месяца, следующего за истекшим. 
 * Если к этой дате оплата не внесена или внесена частично, то с 31-го дня надо начислить пени.
 * Размер пени — 1/300 ключевой ставки Центробанка от суммы долга за каждый день просрочки. 
 * Начиная с 91-го дня пени рассчитывают в повышенном размере — 1/130 ставки.
 * Данный калькулятор пени за коммунальные услуги не учитывает день оплаты как день просрочки.
 */

// Константы
const PENALTY_RATE = 0.095; // Ставка пени 9.5%
const DAYS_30_TO_90_RATE = 1 / 300; // Ставка пени с 31 по 90 день
const DAYS_91_PLUS_RATE = 1 / 130; // Ставка пени с 91 дня

// Форматирование даты в формате dd.mm.yy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
}

// Загрузка долгов и оплат из файла
function loadDebtsFromFile() {
    const fileInput = document.getElementById('debtFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Пожалуйста, выберите файл.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Очистка существующих долгов
        const debtsDiv = document.getElementById('debts');
        debtsDiv.innerHTML = '';
		// Очистка существующих оплат
        const paymentsDiv = document.getElementById('payments');
        paymentsDiv.innerHTML = '';

        // Добавление долгов и оплат из файла
        jsonData.forEach(row => {
            addDebt();
            const lastDebt = debtsDiv.lastElementChild;
            lastDebt.querySelector('.debtAmount').value = row['Сумма долга'];
            lastDebt.querySelector('.debtDate').value = row['Дата начала просрочки'];
			addPayment();
            const lastPayment = paymentsDiv.lastElementChild;
            lastPayment.querySelector('.paymentAmount').value = row['Сумма оплаты'];
            lastPayment.querySelector('.paymentDate').value = row['Дата оплаты'];
        });
    };
    reader.readAsArrayBuffer(file);
}

// Добавление нового долга
function addDebt() {
    const debtsDiv = document.getElementById('debts');
    const newDebt = document.createElement('div');
    newDebt.classList.add('debt');
    newDebt.innerHTML = `
        <label for="debtAmount">Сумма долга (руб):</label>
        <input type="" class="debtAmount" placeholder="Введите сумму долга">
        <label for="debtDate">Дата начала просрочки:</label>
        <input type="date" class="debtDate">
        <button class="del btn" onclick="removeDebt(this)">Удалить</button>
    `;
    debtsDiv.appendChild(newDebt);
}

// Удаление долга
function removeDebt(button) {
    const debtBlock = button.parentElement;
    debtBlock.remove();
}

// Добавление новой оплаты
function addPayment() {
    const paymentsDiv = document.getElementById('payments');
    const newPayment = document.createElement('div');
    newPayment.classList.add('payment');
    newPayment.innerHTML = `
        <label for="paymentAmount">Сумма оплаты (руб):</label>
        <input type="" class="paymentAmount" placeholder="Введите сумму оплаты">
        <label for="paymentDate">Дата оплаты:</label>
        <input type="date" class="paymentDate">
        <button class="del btn" onclick="removePayment(this)">Удалить</button>
    `;
    paymentsDiv.appendChild(newPayment);
}

// Удаление оплаты
function removePayment(button) {
    const paymentBlock = button.parentElement;
    paymentBlock.remove();
}

// Расчет пени
function calculatePenalty() {
    const debts = document.querySelectorAll('.debt');
    const payments = document.querySelectorAll('.payment');
    const endDate = new Date(document.getElementById('endDate').value);

    if (!endDate) {
        alert("Пожалуйста, укажите конечную дату.");
        return;
    }
	
    let totalPenalty = 0;
	let totalPenaltyDolganet = 0;
	let totalDolg = 0;
    let rpaymentDateNow = new Date(0);
	let rpaymentAmount = 0;
	let formula = '';
	let formulaPenalty = 0;
	let resultTab = '';
	let totalResultTab = `
        <table class="res-table" style="border-collapse: collapse; width: 100%; color: #000000; font-size: 12px; background-color: #fff;">
            <tbody>
                <tr>
                    <td>Информация о расчёте</td>
                    <td colspan="7" style="text-align: left;">
                        <div id="dolgnik" contenteditable="true" style="min-height: 16px; cursor: text;" placeholder="Впишите информацию о должнике..." onclick="if(this.innerHTML.trim()==='Впишите информацию о должнике...')this.innerHTML=''">
                            Впишите информацию о должнике...
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Период просрочки:</td>
                    <td colspan="5">с&nbsp;<span>${formatDate(new Date(debts[0].querySelector('.debtDate').value))}</span>&nbsp;по&nbsp;<span>${formatDate(endDate)}</span></td>
                    <td>Процентная ставка:</td>
                    <td>9.50 %</td>
                </tr>
    `;
	
    // Обработка каждого долга
    debts.forEach(debt => {
        const debtAmount = parseFloat(debt.querySelector('.debtAmount').value);
        const debtDate = new Date(debt.querySelector('.debtDate').value);

        if (isNaN(debtAmount) || !debtDate) {
            alert("Пожалуйста, заполните все поля долгов корректно.");
            return;
        }

// Расчет пени за период
    let startDate = debtDate;
    let penalty = 0;
	let penaltyDolganet = 0;
	let remainingDebt = debtAmount;
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 30); // Начинаем с 31-го дня
	let currentDateFirst = new Date(startDate);
    currentDateFirst.setDate(currentDateFirst.getDate() + 29);
    let rcurrentDateFirst = formatDate(currentDateFirst);	
    let rdebtDate = formatDate(debtDate);	
    let startDateLabel = rdebtDate;
    let startDateNew = debtDate;
    let rpaymentDate = 0;
    let startDate30 = new Date(startDate);	
    startDate30.setDate(startDate30.getDate() + 30);
    let startDate90 = new Date(startDate);	
    startDate90.setDate(startDate90.getDate() + 90);
    let dolganet = '';	
    resultTab = '';		
	totalResultTab += `
                    <tr>
                        <td colspan="8" style="text-align: left;">Расчёт пеней по задолженности, возникшей <span>${formatDate(debtDate)}</span></td>
                    </tr>
                    <tr>
                        <td>Задолженность</td>
                        <td>с</td>
                        <td>по</td>
                        <td>дней</td>
                        <td>Ставка</td>
                        <td>Доля ставки</td>
                        <td>Формула</td>
                        <td>Пени</td>
                    </tr>
        `;
	
    while ((currentDate <= endDate) && (remainingDebt > 0)) {
        const daysOverdue = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
        const rate = daysOverdue < 90 ? DAYS_30_TO_90_RATE : DAYS_91_PLUS_RATE;
        const rateLabel = rate === DAYS_30_TO_90_RATE ? '1/300' : '1/130';
        let rcurrentDate = formatDate(currentDate);
		
        // Обработка каждой оплаты
        payments.forEach(payment => {
            const paymentAmount = parseFloat(payment.querySelector('.paymentAmount').value);
            const paymentDate = new Date(payment.querySelector('.paymentDate').value);
            let rpaymentDateLabel = formatDate(paymentDate);	
            let payAmount = rpaymentAmount;
			rpaymentDate = paymentDate;
			
			if (!isNaN(rpaymentAmount) && (rpaymentAmount > 0) && (rpaymentDateNow.getTime() === currentDate.getTime())) {				
                // Уменьшаем оставшийся долг
                remainingDebt -= rpaymentAmount;
				if (remainingDebt > 0) {
				payAmount = rpaymentAmount;
                }else{
				payAmount = rpaymentAmount + remainingDebt;
                }		
				totalResultTab += resultTab + `
                        <tr style="text-align: right;">
                            <td>${(-payAmount).toFixed(2)}</td>
                            <td>${rcurrentDate}</td>
                            <td colspan="6" style="text-align: left;">Погашение части долга</td>
                        </tr>
                    `;
				rpaymentAmount = 0;
				startDateLabel = formatDate(rpaymentDateNow);
				startDateNew = rpaymentDateNow;
            }
            else if (!isNaN(paymentAmount) && (rpaymentDate.getTime() === currentDate.getTime()) && (rpaymentDate.getTime() > rpaymentDateNow.getTime())) {				
                // Уменьшаем оставшийся долг
                remainingDebt -= paymentAmount;
				rpaymentDateNow = rpaymentDate;
				if (remainingDebt > 0) {
				payAmount = paymentAmount;
                }else{
				payAmount = paymentAmount + remainingDebt;
                }							
				totalResultTab += resultTab + `
                        <tr style="text-align: right;">
                            <td>${(-payAmount).toFixed(2)}</td>
                            <td>${rcurrentDate}</td>
                            <td colspan="6" style="text-align: left;">Погашение части долга</td>
                        </tr>
                    `;
				startDateLabel = rpaymentDateLabel;
				startDateNew = rpaymentDate;
            }			
        });	
		
if ((daysOverdue === 30) && (remainingDebt > 0)) {
	resultTab = '<tr style="text-align: right;"><td>' + remainingDebt.toFixed(2) + '</td><td>' + startDateLabel + '</td><td>' + rcurrentDateFirst + '</td><td>' + (1 + Math.floor((currentDateFirst - startDateNew) / (1000 * 60 * 60 * 24))) + '</td><td>9.50 %</td><td>0</td><td>' + remainingDebt.toFixed(2) + ' × 30 × 0 × 9.5%</td><td>0.00</td></tr>';
    totalResultTab += resultTab;
    startDateLabel = rcurrentDate;
    startDateNew = startDate30;
}else if ((daysOverdue === 90) && (remainingDebt > 0)) {	
    totalResultTab += resultTab;
    startDateLabel = rcurrentDate;
    startDateNew = startDate90;
}
		
formula = remainingDebt.toFixed(2) + ' × ' + (1 + Math.floor((currentDate - startDateNew) / (1000 * 60 * 60 * 24))) + ' × ' + rateLabel + ' × 9.5%';
formulaPenalty = remainingDebt * PENALTY_RATE * rate * (1 + Math.floor((currentDate - startDateNew) / (1000 * 60 * 60 * 24)));	
if (remainingDebt > 0) {				
    resultTab = '<tr style="text-align: right;"><td>' + remainingDebt.toFixed(2) + '</td><td>' + startDateLabel + '</td><td>' + rcurrentDate + '</td><td>' + (1 + Math.floor((currentDate - startDateNew) / (1000 * 60 * 60 * 24))) + '</td><td>9.50 %</td><td>' + rateLabel + '</td><td>' + formula + '</td><td>' + formulaPenalty.toFixed(2) + '</td></tr>';
} else	{
    resultTab = '';
}	
    	
    if (remainingDebt > 0) {		
       penalty += remainingDebt * PENALTY_RATE * rate;
	   dolganet = '';
	   penaltyDolganet = penalty;
	   totalDolg = remainingDebt;
    } else	{
       rpaymentAmount = -remainingDebt;
	   penaltyDolganet = 0;// Долг оплачен  
	   dolganet = 'Долг погашен';
	   totalDolg = 0;
    }		
				
    currentDate.setDate(currentDate.getDate() + 1); // Переход к следующему дню  
}

    totalPenalty += penalty;
    totalPenaltyDolganet += penaltyDolganet;	
    totalResultTab += resultTab + `
                <tr>
                    <td colspan="6">${dolganet}</td>
                    <td>Итого:</td>
                    <td>${penalty.toFixed(2)}</td>
                </tr>				
        `;
    });
	
	totalResultTab += `
	            <tr>
                    <td colspan="8">Общая сумма пени: ${totalPenalty.toFixed(2)} руб</td>
                </tr>
				<tr>
                    <td colspan="8">Сумма пени на непогашенный долг: ${totalPenaltyDolganet.toFixed(2)} руб</td>
                </tr>
				<tr>
                    <td colspan="8">Сумма основного долга: ${totalDolg.toFixed(2)} руб</td>
                </tr>
	       </tbody>
        </table>`;
	
    document.getElementById('result').innerHTML = totalResultTab;
}

// Функция для печати таблицы
function printTable() {
    window.print();
}

// Функция для сохранения таблицы в Excel
function saveToExcel() {
    const table = document.querySelector('.res-table'); // Выбираем таблицу
    const workbook = XLSX.utils.table_to_book(table); // Преобразуем таблицу в книгу Excel
    XLSX.writeFile(workbook, 'penalty_calculation.xlsx'); // Сохраняем файл
}

// Подключение библиотеки SheetJS (xlsx.js)
function loadSheetJS() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js';
    script.onload = () => console.log('SheetJS loaded');
    document.head.appendChild(script);
}

// Загружаем библиотеку при запуске
loadSheetJS();