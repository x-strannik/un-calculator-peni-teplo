<?php
/*
Plugin Name: Калькулятор пени за услуги ЖКХ
Plugin URI:  https://kodabra.unchikov.ru/calculator-peni-155/
Description: Плагин для расчета пени за услуги ЖКХ. Используйте шорткод [un_calculator_peni_teplo] для вставки калькулятора на страницу.
Author: Elena Unchikova
Version: 2.0.0
Author URI: https://kodabra.unchikov.ru/
License: GPL2
*/

// Запрет прямого доступа к файлу
if (!defined('ABSPATH')) {
    exit;
}

// Подключение скриптов
function un_calculator_peni_teplo_enqueue_scripts() {    
    // Подключение JavaScript
    wp_enqueue_script(
        'un-calculator-peni-teplo-script',
        plugins_url('un-calculator-peni-teplo.js?v=2.0.0', __FILE__),
        array(), // Зависимости
        null, // Версия
        true // Подключить в футере
    );
}
add_action('wp_enqueue_scripts', 'un_calculator_peni_teplo_enqueue_scripts');

// Шорткод для вставки калькулятора
function un_calculator_peni_teplo_shortcode() {
    ob_start(); // Буферизация вывода
    ?>
<link rel="stylesheet" href="<?php echo plugins_url( 'un-calculator-peni-teplo-styles.css?v=2.0.0' , __FILE__ );?>"> 
    <div class="calculator">
        <div class="noprint">
            <h1 style="text-transform: uppercase;">Калькулятор пени за услуги ЖКХ</h1>
			<div style="margin-bottom: 10px;text-align: center;">Калькулятор пени за коммунальные услуги не учитывает день оплаты как день просрочки.</div>
			
            <label for="keyRate" style="display: inline;">Ставка для расчета пени (%): </label>			
            <input id="keyRate" type="number" value="9.5" step="0.1" class="keyRate" style="width: 20% !important;color: #f4524d !important;">
          
            <!-- Кнопки для загрузки файлов -->
            <div>
                 <label for="debtFile">Загрузить долги и оплаты из файла Excel:</label>
		         <div style="margin-bottom: 10px;text-align: left;"><a href="https://kodabra.unchikov.ru/wp-content/uploads/2025/02/un-calculator-peni-shablon.xlsx"><i class="fas fa-download"></i> Скачать шаблон файла для загрузки</a></div>
                 <input type="file" id="debtFile" accept=".xlsx, .xls">
                 <button class="knop btn" onclick="loadDebtsFromFile()"><i class="fas fa-upload"></i> Загрузить проект</button>
            </div>

            <!-- Поля для ввода долгов -->
            <div id="debts">
                <div class="debt">
                    <label for="debtAmount">Сумма долга (руб):<em>*</em></label>
                    <input type="number" min="0" step="0.01" class="debtAmount" placeholder="Введите сумму долга">

                    <label for="debtDate" class="dDate">Дата начала просрочки:<em>*</em></label>
                    <input type="date" class="debtDate">
                </div>
            </div>
            <button class="knop btn" onclick="addDebt()"><i class="fas fa-plus"></i> Добавить долг</button>

            <!-- Поля для ввода оплат -->
            <div id="payments">
                <div class="payment">
                    <label for="paymentAmount">Сумма оплаты (руб):</label>
                    <input type="number" min="0" step="0.01" class="paymentAmount" placeholder="Введите сумму оплаты">

                    <label for="paymentDate">Дата оплаты:</label>
                    <input type="date" class="paymentDate">
                </div>
            </div>
            <button class="knop btn" onclick="addPayment()"><i class="fas fa-plus"></i> Добавить оплату</button>

			<!-- Поле для конечной даты -->
            <label for="endDate">Конечная дата расчета пени:<em>*</em></label>
            <input type="date" id="endDate">
			
            <!-- Кнопка расчета -->
            <button class="knopras btn" onclick="calculatePenalty()"><i class="fas fa-arrow-down"></i> Рассчитать пеню</button>

            <!-- Результат -->
            <h2>Результат:</h2>
        </div>
        <div id="result"></div>
        <div class="printTable noprint">
            <button class="knop btn" onclick="printTable()"><i class="fas fa-print"></i> Печать</button>
            <button class="knop btn" onclick="saveToExcel()"><i class="fas fa-file-excel"></i> Сохранить в Excel</button>
            <button class="del btn" onclick="window.location.reload();"><i class="fas fa-sync-alt"></i> Очистить</button>
        </div>
    </div>
    <?php
    return ob_get_clean(); // Возвращаем буферизированный вывод
}
add_shortcode('un_calculator_peni_teplo', 'un_calculator_peni_teplo_shortcode');