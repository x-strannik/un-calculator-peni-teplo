/**
 * Калькулятор пени за услуги ЖКХ.
 * URI:  https://kodabra.unchikov.ru/calculator-peni-155/
 * Author: Elena Unchikova
 * Version: 2.0.0
 * Author URI: https://kodabra.unchikov.ru/
 * Description:
 * Потребители коммунальных услуг должны оплачивать услугу ежемесячно до 10 числа месяца, следующего за истекшим. 
 * Если к этой дате оплата не внесена или внесена частично, то с 31-го дня надо начислить пени.
 * Размер пени — 1/300 ключевой ставки Центробанка от суммы долга за каждый день просрочки. 
 * Начиная с 91-го дня пени рассчитывают в повышенном размере — 1/130 ставки.
 * Данный калькулятор пени за коммунальные услуги не учитывает день оплаты как день просрочки.
 */

// Форматирование даты в формате dd.mm.yy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
}

// Форматирование даты из Экселя в формате dd.mm.yy в формат yyyy-mm-dd
function formatDateEx(date) {
    const dayEx = String(date.getDate()).padStart(2, '0');
    const monthEx = String(date.getMonth() + 1).padStart(2, '0');
    const yearEx = String(date.getFullYear());
    return `${yearEx}-${monthEx}-${dayEx}`;
}

// Форматирование текстовой даты из файла dd.mm.yyyy в формат yyyy-mm-dd
function formatDateFile(dateText) {
    const dayFile = String(dateText).slice(0, 2);
    const monthFile = String(dateText).slice(3, 5);
    const yearFile = String(dateText).slice(6);
    return `${yearFile}-${monthFile}-${dayFile}`;
}

// Получение даты из Экселя
function getJsDateFromExcel(excelDate) {
  const SECONDS_IN_DAY = 24 * 60 * 60;
  const MISSING_LEAP_YEAR_DAY = SECONDS_IN_DAY * 1000;
  const MAGIC_NUMBER_OF_DAYS = (25567 + 2);
  const delta = excelDate - MAGIC_NUMBER_OF_DAYS;
  const parsed = delta * MISSING_LEAP_YEAR_DAY;
  const date = new Date(parsed)
  return date
}

// Форматирование суммы из Экселя
function formatExcelAmount(val) {
    if (val === undefined || val === null || val === '') return null;    
    let cleanVal = String(val).replace(/\s/g, '').replace(',', '.');   
    let num = Number(cleanVal);    
    if (isNaN(num) || num === 0) return null;    
    return num.toFixed(2);
}

// Загрузка долгов и оплат из файла Excel, дата в виде dd.mm.yyyy
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

            const lastdebtDate = row['Дата начала просрочки'];
            let lastdebtDateF = formatDateFile(lastdebtDate);// формат в экселе текстовый
            let lastdebtDateFF = formatDateEx(getJsDateFromExcel(lastdebtDate));// формат в экселе дата

            const lastpaymentDate = row['Дата оплаты'];
            let lastpaymentDateF = formatDateFile(lastpaymentDate);// текстовый
            let lastpaymentDateFF = formatDateEx(getJsDateFromExcel(lastpaymentDate));//дата

            let formattedDebt = formatExcelAmount(row['Сумма долга']);
            if (formattedDebt) {
                addDebt();
	            const lastDebt = debtsDiv.lastElementChild;
                lastDebt.querySelector('.debtAmount').value = formattedDebt;
			
            if (lastdebtDateFF !== 'NaN-NaN-NaN' && lastdebtDateFF !== 'N.NaN-.N-Na' && lastdebtDateFF !== undefined && lastdebtDateFF !== null && lastdebtDateFF !== 0) {
	               lastDebt.querySelector('.debtDate').value = lastdebtDateFF;
            } else {
	               lastDebt.querySelector('.debtDate').value = lastdebtDateF;
            }	
			}			
		
			let formattedPay = formatExcelAmount(row['Сумма оплаты']);
            if (formattedPay) {
                addPayment(); 
	            const lastPayment = paymentsDiv.lastElementChild;
                lastPayment.querySelector('.paymentAmount').value = formattedPay;
			
            if (lastpaymentDateFF !== 'NaN-NaN-NaN' && lastpaymentDateFF !== 'N.NaN-.N-Na' && lastpaymentDateFF !== undefined && lastpaymentDateFF !== null && lastpaymentDateFF !== 0) {
	               lastPayment.querySelector('.paymentDate').value = lastpaymentDateFF;
            } else {
	               lastPayment.querySelector('.paymentDate').value = lastpaymentDateF;
            }				 			
            }		
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
        <input type="number" min="0" step="0.01" class="debtAmount" placeholder="Введите сумму долга">
        <label for="debtDate">Дата начала просрочки:</label>
        <input type="date" class="debtDate">
        <button class="del btn" onclick="removeDebt(this)"><i class="fas fa-minus"></i> Удалить</button>
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
        <input type="number" min="0" step="0.01" class="paymentAmount" placeholder="Введите сумму оплаты">
        <label for="paymentDate">Дата оплаты:</label>
        <input type="date" class="paymentDate">
        <button class="del btn" onclick="removePayment(this)"><i class="fas fa-minus"></i> Удалить</button>
    `;
    paymentsDiv.appendChild(newPayment);
}

// Удаление оплаты
function removePayment(button) {
    const paymentBlock = button.parentElement;
    paymentBlock.remove();
}

//// Расчет пени *********************************************************************************************************************************
function calculatePenalty() {
	const DAYS_30_RATE = 0; // Ставка пени с 1 по 30 день
	const DAYS_30_TO_90_RATE = 1 / 300; // Ставка пени с 31 по 90 день
    const DAYS_91_PLUS_RATE = 1 / 130; // Ставка пени с 91 дня
    const PEN_RATE = document.getElementById('keyRate').value;
    const debts = document.querySelectorAll('.debt');
    const payments = document.querySelectorAll('.payment');
    const endDate = new Date(document.getElementById('endDate').value);
	const debtDateN = new Date(debts[0].querySelector('.debtDate').value);
		
	if (!PEN_RATE) {
        alert("Пожалуйста, укажите ставку для расчета пени.");
        return;
    }	
    if (!document.getElementById('endDate').value) {
        alert("Пожалуйста, укажите конечную дату.");
        return;
    }
	
	let PENALTY_RATE = PEN_RATE/100;
    let totalPenalty = 0;
	let totalPenaltyDolganet = 0;
	let totalDolg = 0;
	let totalDolgSum = 0;
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
                    <td colspan="5">с&nbsp;<span>${formatDate(debtDateN)}</span>&nbsp;по&nbsp;<span>${formatDate(endDate)}</span></td>
                    <td>Процентная ставка:</td>
                    <td>${PEN_RATE} %</td>
                </tr>
    `;
	
let q = 0;	
let qq = 0;		
// Обработка каждого долга
    debts.forEach(debt => {
        const debtAmount = parseFloat(debt.querySelector('.debtAmount').value);
        const debtDate = new Date(debt.querySelector('.debtDate').value);

        if ((isNaN(debtAmount) || !debt.querySelector('.debtDate').value) && (q === 0)) {
            alert("Пожалуйста, заполните все поля долгов корректно.");
			q = 1;
          return;
        }

// Расчет пени за период
    let startDate = debtDate;
    let penalty = 0;
	let penaltyDolganet = 0;
	let remainingDebt = debtAmount;
    let currentDate = new Date(startDate);
    let startDateNew = new Date(startDate);
    let rpaymentDate = 0;	
    let dolganet = '';
    let resultTabZ = '';	
    resultTab = '';	
	totalResultTab += `
                    <tr>
                        <td colspan="8" style="text-align: left;">Расчёт пеней по задолженности, возникшей <span>&nbsp;${formatDate(debtDate)}</span></td>
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

let i = 0;
let n1 = 30;
let n2 = 90;	
	
// Обработка каждого дня		
    while ((currentDate <= endDate) && (remainingDebt > 0)) {
		i = i + 1;
		let penaltyZ = 0;		     
       
		let rate = DAYS_30_RATE;
	    let rateLabel = '0';
		if ((i > n1) && (i <= n2)) {
		    rate = DAYS_30_TO_90_RATE;		
		    rateLabel = '1/300';
        } else if (i > n2) {			
                rate = DAYS_91_PLUS_RATE;
		        rateLabel = '1/130';            
        }

let NnDate = new Date(0); 
// Обработка каждой оплаты	
        for (const payment of payments) {
            const amountInput = payment.querySelector('.paymentAmount');
            const dateInput = payment.querySelector('.paymentDate');
            // Проверка на существование элементов, чтобы избежать ошибок
            if (!amountInput || !dateInput) continue; 
            const paymentAmount = parseFloat(amountInput.value);
            const paymentDate = new Date(dateInput.value);	
			
            if (((isNaN(paymentAmount) && (dateInput.value.trim() !== "")) || (!isNaN(paymentAmount) && (dateInput.value.trim() === ""))) && (qq === 0)) {
                alert("Пожалуйста, заполните все поля оплат корректно.");
			    qq = 1;
                return;
            }						
		
            let rpaymentDateLabel = formatDate(paymentDate);	
            let payAmount = rpaymentAmount;
			rpaymentDate = paymentDate;
			
// Переходящий остаток оплаты раньше начала долга		
			if (!isNaN(rpaymentAmount) && (rpaymentAmount.toFixed(2) > 0) && (rpaymentDateNow <= debtDate)) {	
                resultTabZ = `
				        <tr style="text-align: right;">
						    <td>${remainingDebt.toFixed(2)}</td>
							<td>${formatDate(debtDate)}</td>
							<td colspan="6" style="text-align: left;">Задолженность</td>
						</tr>
                    `;					
                // Уменьшаем оставшийся долг
                remainingDebt -= rpaymentAmount;
				if (remainingDebt > 0) {
				    payAmount = rpaymentAmount;			
                } else {
				    payAmount = rpaymentAmount + remainingDebt;
                }					
				totalResultTab += resultTabZ + `
                        <tr style="text-align: right;">
                            <td>${(-payAmount).toFixed(2)}</td>
                            <td>${formatDate(rpaymentDateNow)}</td>
                            <td colspan="6" style="text-align: left;">Погашение части долга (переходящий остаток)</td>
                        </tr>
                    `;									
if (remainingDebt.toFixed(2) < 0) {
    break;
} else if (remainingDebt.toFixed(2) > 0) {
	rpaymentAmount = 0;
	rpaymentDateNow.setDate(rpaymentDateNow.getDate() + 1);	
} else {
	rpaymentAmount = 0;
	rpaymentDateNow.setDate(rpaymentDateNow.getDate() + 1);
	break;
}	
            }			
// Переходящий остаток оплаты		
			else if (!isNaN(rpaymentAmount) && (rpaymentAmount.toFixed(2) > 0) && (rpaymentDateNow.getTime() === currentDate.getTime())) {	                			
                // Уменьшаем оставшийся долг
                remainingDebt -= rpaymentAmount;
				if (remainingDebt > 0) {
				    payAmount = rpaymentAmount;				    
                } else {
				    payAmount = rpaymentAmount + remainingDebt;
                }	
				totalResultTab += resultTab + `
                        <tr style="text-align: right;">
                            <td>${(-payAmount).toFixed(2)}</td>
                            <td>${formatDate(rpaymentDateNow)}</td>
                            <td colspan="6" style="text-align: left;">Погашение части долга (переходящий остаток)</td>
                        </tr>
                    `;				
					startDateNew = new Date(rpaymentDateNow.getTime());	
					NnDate = new Date(startDateNew.getTime());
if (remainingDebt.toFixed(2) < 0) {
    break;
} else if (remainingDebt.toFixed(2) > 0) {
	rpaymentAmount = 0;
	rpaymentDateNow.setDate(rpaymentDateNow.getDate() + 1);	
} else {
	rpaymentAmount = 0;
	rpaymentDateNow.setDate(rpaymentDateNow.getDate() + 1);
	break;
}						
            }			
//// Текущая оплата		
		    else if (!isNaN(paymentAmount) && (rpaymentDate <= currentDate) && (rpaymentDate >= rpaymentDateNow)) {          								
				if (rpaymentDate <= debtDate){
				resultTab = `
				        <tr style="text-align: right;">
						    <td>${remainingDebt.toFixed(2)}</td>
							<td>${formatDate(debtDate)}</td>
							<td colspan="6" style="text-align: left;">Задолженность</td>
						</tr>
                    `;						
				}	
				// Уменьшаем оставшийся долг
                remainingDebt -= paymentAmount;
				rpaymentDateNow = rpaymentDate;
				if (remainingDebt > 0) {
				    payAmount = paymentAmount;								    
                } else {
				    payAmount = paymentAmount + remainingDebt;
                }							
				totalResultTab += resultTab + `
                        <tr style="text-align: right;">
                            <td>${(-payAmount).toFixed(2)}</td>
                            <td>${formatDate(rpaymentDate)}</td>
                            <td colspan="6" style="text-align: left;">Погашение части долга</td>
                        </tr>
                    `;						
				if ((remainingDebt > 0) && (rpaymentDate.getTime() === currentDate.getTime())) {					
						startDateNew = new Date(paymentDate.getTime());						
                } else if ((remainingDebt > 0) && (rpaymentDate < currentDate)) {
				   	//...;
                } else {
				    resultTab = '';  
                }	
				if (currentDate.getTime() === endDate.getTime()) {
					resultTab = '';
                }
				NnDate = new Date(startDateNew.getTime());	     
if (remainingDebt.toFixed(2) < 0) {
    break;
} else if (remainingDebt.toFixed(2) > 0) {
	rpaymentAmount = 0;
	rpaymentDateNow.setDate(rpaymentDateNow.getDate() + 1);	
} else {
	rpaymentAmount = 0;
	rpaymentDateNow.setDate(rpaymentDateNow.getDate() + 1);
	break;
}				
            }			
        };	
		
if (((i===(n1 + 1)) || (i===(n2 + 1))) && (currentDate.getTime() != NnDate.getTime())){
        totalResultTab += resultTab;	
        startDateNew.setDate(startDateNew.getDate() + Math.floor((currentDate - startDateNew) / (1000 * 60 * 60 * 24)));	
    }	
if (remainingDebt > 0) {	    		
        formula = remainingDebt.toFixed(2) + ' × ' + (1 + Math.floor((currentDate - startDateNew) / (1000 * 60 * 60 * 24))) + ' × ' + rateLabel + ' × ' +  PEN_RATE + '%';
        formulaPenalty = remainingDebt * PENALTY_RATE * rate * (1 + Math.floor((currentDate - startDateNew) / (1000 * 60 * 60 * 24)));	
        resultTab = `
		<tr style="text-align: right;">
		<td>${remainingDebt.toFixed(2)}</td>
		<td>${formatDate(startDateNew)}</td>
		<td>${formatDate(currentDate)}</td>
		<td>${(1 + Math.floor((currentDate - startDateNew) / (1000 * 60 * 60 * 24)))}</td>
		<td>${PEN_RATE} %</td>
		<td>${rateLabel}</td>
		<td>${formula}</td>
		<td>${formulaPenalty.toFixed(2)}</td>
		</tr>`;	  	    
} else {
    resultTab = '';
}	

	if (remainingDebt > 0) {        
       penalty += remainingDebt * PENALTY_RATE * rate;        
	   dolganet = '';
	   penaltyDolganet = penalty;
    } else {
       rpaymentAmount = -remainingDebt;
	   penaltyDolganet = 0;// Долг оплачен  
	   dolganet = 'Долг погашен';
    }							
    currentDate.setDate(currentDate.getDate() + 1); // Переход к следующему дню  
}

if ((penalty > 0) && (remainingDebt > 0)) {
	totalDolg = remainingDebt;
} else {
	totalDolg = 0;
}		
    totalPenalty += penalty;
    totalPenaltyDolganet += penaltyDolganet;
    totalDolgSum += totalDolg;
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
                    <td colspan="8">Сумма просроченного непогашенного долга: ${totalDolgSum.toFixed(2)} руб</td>
                </tr>
	       </tbody>
        </table>`;
	
    document.getElementById('result').innerHTML = totalResultTab;
}
//// Расчет пени *********************************************************************************************************************************

//// Сохранение результатов *********************************************************************************************************************************
// Функция для печати таблицы
function printTable() {
    window.print();
}
document.getElementById("respond")?.classList.add("noprint");
document.getElementById("comments")?.classList.add("noprint");

// Функция для сохранения таблицы в Excel
function saveToExcel() {
    const table = document.querySelector('.res-table');
    const workbook = XLSX.utils.table_to_book(table, { raw: false, dateNF: 'dd.mm.yyyy' });
    const sheet = workbook.Sheets[workbook.SheetNames];
    const range = XLSX.utils.decode_range(sheet['!ref']);

    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            if (!sheet[addr]) sheet[addr] = { t: 'z', v: '' };            
            const cellData = sheet[addr];
            if (cellData.v && typeof cellData.v === 'string' && /^\d{2}\.\d{2}\.\d{2}$/.test(cellData.v)) {
                const [d, m, y] = cellData.v.split('.').map(Number);                
                // ИСПОЛЬЗУЕМ Date.UTC чтобы избежать сдвига из-за часовых поясов
                cellData.t = 'd';
                cellData.v = new Date(Date.UTC(2000 + y, m - 1, d)); 
                cellData.z = 'dd.mm.yyyy';
            }
        }
    }

    sheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 35 }, { wch: 15 }];
    XLSX.writeFile(workbook, 'penalty_calculation.xlsx');
}

//// Подключение библиотеки SheetJS (xlsx.js)
function loadSheetJS() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js';
    script.onload = () => console.log('SheetJS loaded');
    document.head.appendChild(script);
}
// Загружать один раз при инициализации страницы
document.addEventListener('DOMContentLoaded', function() {
    if (typeof XLSX === 'undefined') {
        loadSheetJS();
    }
});

// Подключаем Font Awesome для иконок, если ещё не подключен
function isFontAwesomeLoaded() {
    const span = document.createElement('span');
    span.className = 'fas'; 
    span.style.display = 'none';
    document.body.insertBefore(span, document.body.firstChild);    
    const fontFamily = window.getComputedStyle(span, null).getPropertyValue('font-family');   
    document.body.removeChild(span);    
    return fontFamily.includes('Font Awesome');
}
if (!isFontAwesomeLoaded()) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    document.head.appendChild(link);
    console.log("Font Awesome подключен через CDN");
}