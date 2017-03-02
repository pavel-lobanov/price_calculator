const _NORMAL_RATIO        = 1;
const _SUV_RATIO           = 1.2;
const _RUN_FLAT_RATIO      = 1.5;
const _KM_OUT_MKAD         = 1.5;
const _NORMAL_DEPARTURE    = 20;
const _NIGHT_DEPARTURE     = 25;
const _VALVE_INSTALATION   = 1.5;
const _FLUFF_BEAD_SEALANT  = 2;
const _TYRE_BAG            = 0.7;
const _PRESSURE_CHECK      = 0.2;
const _ONE_WHEEL_SET_PRICE = {
r13: 8.5,
r14: 9,
r15: 9.5,
r16: 10,
r17: 10.5,
r18: 11,
r19: 11.5,
r20: 12,
r21: 13
};
const _PATCH_PRICE_AND_DESCRIPTION = [
{name: 'UP-3', price: 6, description: "Повреждение шины шурупом, гвоздем,саморезом и др."},
{name: 'UP-4,5', price: 7, description: "Повреждение шины до 2мм"},
{name: 'R-10', price: 11, description: "Повреждение шины  2-3мм"},
{name: 'R-12', price: 14, description: "Повреждение шины  3-5мм"},
{name: 'R-13', price: 13, description: "Повреждение шины  3-5мм"},
{name: 'R-15', price: 15, description: "Повреждение шины  5-7мм"},
{name: 'R-20', price: 20, description: "Повреждение шины  7-10мм"},
{name: 'Грибок G-7', price: 12, description: "Повреждение шины круглым придметом"},
{name: 'Грибок G-9', price: 14, description: "Повреждение шины круглым придметом до 2мм"},
]


let form = document.forms.price_calculator;

function setListeners () {
	var serviceSelect = document.getElementById('service');
	serviceSelect.onchange = checkTypeOfService;
	var calcButton = document.getElementById('calculate_button');
	calcButton.onclick = calculatePrice;
}

function checkTypeOfService () {
	let serviceField = document.getElementById('service');
	let serviceType = serviceField.value;
	let repairSelect = document.getElementById('damage_type');
	switch (serviceType) {
		case 'repair': //если выбрано "Ремонт"
			if (!repairSelect) { //если поле не создано, то создаем его
				let label = document.createElement('label');
				let select = document.createElement('select');
				for (var i = 0; i < _PATCH_PRICE_AND_DESCRIPTION.length; i++) {
					let option = document.createElement('option');
					option.textContent = _PATCH_PRICE_AND_DESCRIPTION[i].description + 
					' (' + _PATCH_PRICE_AND_DESCRIPTION[i].name  + ')';
					option.value = i;
					select.appendChild(option);
				}
				label.textContent = "Укажите тип повреждения:";
				label.for = 'damage_type';
				select.id = 'damage_type';
				label.appendChild(select);
				form.insertBefore(label, form.children[2]); //вставляем поле перед размером колеса
			} 
			break;
		default:
			if (repairSelect) {
				form.removeChild(repairSelect.parentNode);
			}
			break;
	}
}

function checkForm () {
	for (var i = 1; i < form.elements.length; i++) {
		if (form.elements[i].tagName === 'SELECT') {
			console.log(form.elements[i].value);
		}
	}
}

function calculatePrice () {
	let repairSelect    = document.getElementById('damage_type');
	let finalPriceField = document.getElementById('final_price');
	let carPriceRatio, wheelPrice, wheelsCount, finalPrice, departure,
	patchPrice = 0, 
	runFlat = 0;

	carPriceRatio = form.elements['car_type'].value == 'light'?_NORMAL_RATIO:_SUV_RATIO;
	wheelPrice    = _ONE_WHEEL_SET_PRICE[form.elements['tyre_size'].value];
	departure     = form.elements['time_departure'].value == 'day'?_NORMAL_DEPARTURE:_NIGHT_DEPARTURE;
	wheelsCount   = form.elements['tyre_count'].value;
	if (repairSelect) {
		patchPrice = _PATCH_PRICE_AND_DESCRIPTION[ form.elements['damage_type'].value ].price;
	}
	
	finalPrice = (wheelPrice * wheelsCount) * carPriceRatio + departure + patchPrice;
	finalPriceField.textContent = "Итого: " + finalPrice + " руб";
}

setListeners();
 