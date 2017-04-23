;(function(){
	const _NORMAL_RATIO        = 1;
	const _SUV_RATIO           = 1.2;
	const _RUN_FLAT_RATIO      = 1.5;
	const _KM_OUT_MKAD         = 1.5;
	const _NORMAL_DEPARTURE    = 18;
	const _NIGHT_DEPARTURE     = 25;
	const _VALVE_INSTALATION   = 1.5;
	const _FLUFF_BEAD_SEALANT  = 2;
	const _TYRE_BAG            = 0.7;
	const _PRESSURE_CHECK      = 0.2;
	const _ONE_WHEEL_SET_PRICE = {
	r13: {fullPrice : 8.5, onWheel : 4.5},
	r14: {fullPrice : 9, onWheel : 4.75},
	r15: {fullPrice : 9.5, onWheel : 4.75},
	r16: {fullPrice : 10, onWheel : 5.25},
	r17: {fullPrice : 10.5, onWheel : 5.375},
	r18: {fullPrice : 11, onWheel : 5.75},
	r19: {fullPrice : 11.5, onWheel : 6.25},
	r20: {fullPrice : 12, onWheel : 6.5},
	r21: {fullPrice : 13, onWheel : 7}
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
	{name: 'Замена вентиля', price: 1.5, description: "Пропускает воздух через вентиль"},
	{name: 'Герметик', price: 2, description: "Пропускает воздух через диск"}
	]


	var form = document.forms.price_calculator,
		changeOnWheels = false,
		changeStepney = false;
	//устанавливает события на форму
	function setListeners () {
		var serviceSelect      = document.getElementById('service');
		serviceSelect.onchange = checkTypeOfService;//слушает события вида услуги
		var calcButton         = document.getElementById('calculate_button');
		calcButton.onclick     = calculatePrice;//слушает кнопку подсчета
		form.onchange          = clearFinalPrice;//слушает на изменения поля
	}
	//Строит список из выбранного вида услуги
	function checkTypeOfService () {
		var serviceField = document.getElementById('service');
		var serviceType = serviceField.value;
		var repairSelect = document.getElementById('damage_type');
		var tyreCount = document.getElementById('tyre_count');
		switch (serviceType) {
			case 'repair': //если выбрано "Ремонт"
				if (!repairSelect) { //если поле не создано, то создаем его
					var label = document.createElement('label');
					var select = document.createElement('select');
					for (var i = 0; i < _PATCH_PRICE_AND_DESCRIPTION.length; i++) {
						var option = document.createElement('option');
						option.textContent = _PATCH_PRICE_AND_DESCRIPTION[i].description + 
						' (' + _PATCH_PRICE_AND_DESCRIPTION[i].name  + ')';
						option.value = i;
						select.appendChild(option);
					}
					label.textContent = "Укажите тип повреждения: ";
					label.for         = 'damage_type';
					select.id         = 'damage_type';
					select.name       = 'damage_type';
					select.className  = "form-control";
					label.appendChild(select);
					form.insertBefore(label, form.children[2]); //вставляем поле перед размером колеса
					tyreCount.parentNode.classList.toggle('hide');
				} 
				break;
			case 'stepney': 
				for (var i = 1; i < 5; i++) {
					form.elements[i].parentNode.classList.add('hide');
				}
				changeStepney = true;
				break;
			default://иначе строит список для переобувки
				if (repairSelect) {
					form.removeChild(repairSelect.parentNode);
					tyreCount.parentNode.classList.toggle('hide');
				}

				if (serviceType == 'tire_change_on_wheels') {
					changeOnWheels = true;
				} else {
					changeOnWheels = false;
				}

				if (changeStepney) {
					for (var i = 1; i < 5; i++) {
						form.elements[i].parentNode.classList.remove('hide');
					}
					changeStepney = false;
				}
				break;
			
		}
	}
	//Чистим поле с ценой, каждый раз, когда изменяется поле формы
	function clearFinalPrice () {
		var totalPrice = document.getElementById('final_price');
		totalPrice.style.opacity = 0;
		totalPrice.ontransitionend = function () {totalPrice.textContent = ''};
	}

	function calculatePrice () {
		var repairSelect    = document.getElementById('damage_type');
		var finalPriceField = document.getElementById('final_price');
		var carPriceRatio, wheelPrice, wheelsCount, finalPrice, departure, outMkadKm, changeType;

		//Собираем значения из полей
		if (!changeStepney) {
			carPriceRatio = form.elements['car_type'].value == 'light' ? _NORMAL_RATIO : _SUV_RATIO;
			if ( form.elements['run_flat'].checked ) carPriceRatio = _RUN_FLAT_RATIO;//если это RunFlat
			if (changeOnWheels) {
				changeType = 'onWheel'; //если перекидка, то ставим тип перекидка
			} else {
				changeType = 'fullPrice'; //инчаче цена переобувки
			}

		switch (form.elements['time_departure'].value) {
			case 'day':
				departure = _NORMAL_DEPARTURE;
				break;
			case 'night':
				departure = _NIGHT_DEPARTURE;
				break;
			default:
				departure = 0;
				break;
		}

		wheelPrice    = _ONE_WHEEL_SET_PRICE[ form.elements['tyre_size'].value ][changeType];
		wheelsCount   = parseInt( form.elements['tyre_count'].value );
		outMkadKm	  = form['out_MKAD_km'].value * _KM_OUT_MKAD;
		patchPrice    = (repairSelect) ? 
		_PATCH_PRICE_AND_DESCRIPTION[ form.elements['damage_type'].value ].price : 0;

		if (repairSelect) wheelsCount = 1;
			finalPrice    = (wheelPrice * wheelsCount) * carPriceRatio + departure + patchPrice + outMkadKm;
		} else {
			departure  = form.elements['time_departure'].value == 'day' ? 25 : 30;
			outMkadKm  = form['out_MKAD_km'].value * _KM_OUT_MKAD;
			
			finalPrice = departure + outMkadKm;
		}
		
		//Добавляем нули в копейки
		finalPrice = finalPrice.toString().split('.');
		if (finalPrice[1] && finalPrice[1].length < 2) { 
			finalPrice[1] += '0';
		} else {
			finalPrice[1] = '00';
		}

		//display total price
		finalPriceField.innerHTML = "<strong>Итого</strong>: от <strong>" + finalPrice[0] + 
		"</strong> руб. <strong>" + finalPrice[1] + "</strong> коп.";
		finalPriceField.style.opacity = 1;
	}

	setListeners();
	checkTypeOfService ();
 
})();
