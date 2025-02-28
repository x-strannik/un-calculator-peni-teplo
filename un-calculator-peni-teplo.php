<?php
/*
Plugin Name: Калькулятор пени за услуги ЖКХ
Plugin URI:  https://kodabra.unchikov.ru/calculator-peni-155/
Description: Плагин для расчета пени за услуги ЖКХ. Используйте шорткод [un_calculator_peni_teplo] для вставки калькулятора на страницу.
Author: Elena Unchikova
Version: 1.0.0
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
        plugins_url('un-calculator-peni-teplo.js', __FILE__),
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
<link rel="stylesheet" href="<?php echo plugins_url( 'un-calculator-peni-teplo-styles.css' , __FILE__ );?>"> 
    <div class="calculator">
        <div class="noprint">
            <h1>Калькулятор пени за услуги ЖКХ (актуален на 2025 год)</h1>

            <!-- Поля для ввода долгов -->
            <div id="debts">
                <div class="debt">
                    <label for="debtAmount">Сумма долга (руб):<em>*</em></label>
                    <input type="number" class="debtAmount" placeholder="Введите сумму долга">

                    <label for="debtDate">Дата начала просрочки:<em>*</em></label>
                    <input type="date" class="debtDate">
                </div>
            </div>
            <button class="knop btn" onclick="addDebt()">Добавить долг</button>

            <!-- Поле для конечной даты -->
            <label for="endDate">Конечная дата расчета пени:<em>*</em></label>
            <input type="date" id="endDate">

            <!-- Поля для ввода оплат -->
            <div id="payments">
                <div class="payment">
                    <label for="paymentAmount">Сумма оплаты (руб):</label>
                    <input type="number" class="paymentAmount" placeholder="Введите сумму оплаты">

                    <label for="paymentDate">Дата оплаты:</label>
                    <input type="date" class="paymentDate">
                </div>
            </div>
            <button class="knop btn" onclick="addPayment()">Добавить оплату</button>

            <!-- Кнопка расчета -->
            <button class="knopras btn" onclick="calculatePenalty()">Рассчитать пеню</button>

            <!-- Результат -->
            <h2>Результат:</h2>
        </div>
        <div id="result"></div>
        <div class="printTable noprint">
            <button class="knop btn" onclick="printTable()">Печать</button>
            <button class="knop btn" onclick="saveToExcel()">Сохранить в Excel</button>
            <button class="del btn" onclick="window.location.reload();">Очистить</button>
        </div>
    </div>
    <?php
    return ob_get_clean(); // Возвращаем буферизированный вывод
}
add_shortcode('un_calculator_peni_teplo', 'un_calculator_peni_teplo_shortcode');