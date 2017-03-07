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
	{name: 'Замена вентиля', price: 1.5, description: "Пропускает воздух через вентиль"},
	{name: 'Герметик', price: 2, description: "Пропускает воздух через диск"}
	]


	var form = document.forms.price_calculator;
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
					label.for = 'damage_type';
					select.id = 'damage_type';
					select.name = 'damage_type';
					select.className = "form-control";
					label.appendChild(select);
					form.insertBefore(label, form.children[2]); //вставляем поле перед размером колеса
					tyreCount.parentNode.classList.toggle('hide');
				} 
				break;
			default://иначе строит список для переобувки
				if (repairSelect) {
					form.removeChild(repairSelect.parentNode);
					tyreCount.parentNode.classList.toggle('hide');
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
		var carPriceRatio, wheelPrice, wheelsCount, finalPrice, departure, outMkadKm;
		//Собираем значени из полей
		carPriceRatio = form.elements['car_type'].value == 'light' ? _NORMAL_RATIO : _SUV_RATIO;
		if ( form.elements['run_flat'].checked ) carPriceRatio = _RUN_FLAT_RATIO;
		wheelPrice    = _ONE_WHEEL_SET_PRICE[ form.elements['tyre_size'].value ];
		departure     = form.elements['time_departure'].value == 'day' ? _NORMAL_DEPARTURE : _NIGHT_DEPARTURE;
		wheelsCount   = parseInt( form.elements['tyre_count'].value );
		outMkadKm	  = form['out_MKAD_km'].value * _KM_OUT_MKAD;
		patchPrice    = (repairSelect) ? 
		_PATCH_PRICE_AND_DESCRIPTION[ form.elements['damage_type'].value ].price : 0;
		if (repairSelect) wheelsCount = 1;
		//Расчет цены
		finalPrice    = ( (wheelPrice * wheelsCount) * carPriceRatio + departure + patchPrice + outMkadKm).toString().split('.');
		//Добавляем нули в копейки
		if (finalPrice[1] && finalPrice[1].length < 2) { 
			finalPrice[1] += '0';
		} else {
			finalPrice[1] = '00';
		}
		finalPriceField.innerHTML = "<strong>Итого</strong>: от <strong>" + finalPrice[0] + 
		"</strong> руб. <strong>" + finalPrice[1] + "</strong> коп.";
		finalPriceField.style.opacity = 1;
	}

	setListeners();
	checkTypeOfService ();
 
})();
