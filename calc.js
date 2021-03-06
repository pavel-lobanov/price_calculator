;(function(){
	const _NORMAL_RATIO        = 1;
	const _SUV_RATIO           = 1.2;
	const _RUN_FLAT_RATIO      = 1.2;
	const _KM_OUT_MKAD         = 1.4;
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
	{name: 'UP-3', price: 6, description: "Повреждение гвоздем,саморезом и др."},
	{name: 'UP-4,5', price: 7, description: "Повреждение до 2мм"},
	{name: 'R-10', price: 11, description: "Повреждение 2-3мм"},
	{name: 'R-12', price: 14, description: "Повреждение 3-5мм"},
	{name: 'R-13', price: 13, description: "Повреждение 3-5мм"},
	{name: 'R-15', price: 15, description: "Повреждение 5-7мм"},
	{name: 'R-20', price: 20, description: "Повреждение 7-10мм"},
	{name: 'Грибок G-7', price: 12, description: "Повреждение круглым придметом"},
	{name: 'Грибок G-9', price: 14, description: "Повреждение круглым придметом(до 4мм)"},
	{name: 'Замена вентиля', price: 1.5, description: "Пропускает воздух через вентиль"},
	{name: 'Герметик', price: 2, description: "Пропускает воздух через диск"},
	{name: 'Наше колесо', price: 20, description: "Если колесо невозможно восстановить"}
	];
	var form                   = document.forms.price_calculator,
			repairTire						 = true,
			changeTire             = false,
			changeStepney          = false,
			amountOfAdditionalCars = 0,
			carTypeLabel           = document.getElementById('car_type').parentNode,
			tireSizeLabel          = document.getElementById('tyre_size').parentNode;

	//устанавливает события на форму
	function setListeners () {
		var serviceSelect      = document.getElementById('service');
		serviceSelect.onchange = renderListOfServices;//слушает события вида услуги
		var calcButton         = document.getElementById('calculate_button');
		calcButton.onclick     = calculatePrice;//слушает кнопку подсчета
		form.onchange          = clearFinalPrice;//слушает на изменения поля
	}
	//Строит список из выбранного вида услуги
	function renderListOfServices () {
		var serviceField  = document.getElementById('service');
		var serviceType   = serviceField.value;
		var repairSelect  = document.getElementById('damage_type');
		var departureTime = document.getElementById('time_departure');
		removeCarContainer();
		removeAddButton();
		if (changeStepney) {//if list item "stepney" was choosen
			departureTime.children[2].classList.toggle('hide');
			for (var i = 1; i < 4; i++) {
				form.elements[i].parentNode.classList.remove('hide');
			}
			changeStepney = false;
		}
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
					label.setAttribute('for', 'damage_type');
					label.innerHTML   = "Укажите повреждение шины:&nbsp;";
					select.id         = 'damage_type';
					select.className  = "form-control";
					label.appendChild(select);
					form.insertBefore(label, form.children[2]); //вставляем поле перед размером колеса
				} 
				if (changeTire) {
					form.removeChild( document.getElementById('cars-container') );
					amountOfAdditionalCars = 0;
					changeTire             = false;
					carTypeLabel.classList.toggle('hide');
					tireSizeLabel.classList.toggle('hide');
				}
				repairTire = true;
				break;
			case 'stepney':
				if (changeTire) {
						form.removeChild( document.getElementById('cars-container') );
						amountOfAdditionalCars = 0;
						changeTire             = false;
						carTypeLabel.classList.toggle('hide');
						// tireSizeLabel.classList.toggle('hide');
				} 
				for (var i = 1; i < 4; i++) {
					if (form.elements[i].id === 'time_departure') continue;
					form.elements[i].parentNode.classList.add('hide');
				}
				departureTime.children[2].classList.toggle('hide');
				repairTire    = false;
				changeTire 		= false;
				changeStepney = true;
				break;
			default://иначе строит список для переобувки
				if (repairSelect) {
					form.removeChild(repairSelect.parentNode);
					carTypeLabel.classList.toggle('hide');
					tireSizeLabel.classList.toggle('hide');
				}
				repairTire    = false;
				changeTire 		= true;
				createChangeTireBlock();
				addButton();
				break;
			
		}
	}

	function createChangeTireBlock (arguments) {
		var carsContainer  	   = document.createElement('div'),
				carDiv             = document.createElement('div'),
				carTypeLabelClone  = carTypeLabel.cloneNode(true),
				tireSizeLabelClone = tireSizeLabel.cloneNode(true),
				tireCountField     = document.createElement('select'),
				tireOnWheelsField  = document.createElement('input'),
				runFlatField       = document.createElement('input'),
				labelElement1      = document.createElement('label'),
				labelElement2      = document.createElement('label'),
				labelElement3      = document.createElement('label'),
				h4Element          = document.createElement('h4');
		carsContainer.id = 'cars-container';
		h4Element.className = 'car-number-h4'
		h4Element.textContent = 'Авто №' + (++amountOfAdditionalCars);
		carTypeLabelClone.className = '';
		tireSizeLabelClone.className = '';
		for (var i = 1; i < 5; i++) {
			var option = document.createElement('option');
			if (i === 4) {
				option.selected = true;
			}
			option.value = i;
			option.textContent = i;
			tireCountField.appendChild(option);
		}
		tireCountField.id = 'tyre-count';
		tireCountField.className = 'form-control';
		labelElement1.innerHTML = "Кол-во колес&nbsp;";
		labelElement1.appendChild(tireCountField);
		tireOnWheelsField.id = 'on-wheels-check';
		tireOnWheelsField.type = 'checkbox';
		runFlatField.id = 'run-flat-check';
		runFlatField.type = 'checkbox';
		labelElement2.innerHTML = "Резина на дисках&nbsp;";
		labelElement2.appendChild(tireOnWheelsField);
		labelElement3.innerHTML = "Run Flat&nbsp;";
		labelElement3.appendChild(runFlatField);
		carDiv.dataset.additionalCarNum = amountOfAdditionalCars;
		carDiv.className = 'jumbotron';
		carDiv.append(h4Element,carTypeLabelClone,tireSizeLabelClone,labelElement1,labelElement2,labelElement3);
		carsContainer.appendChild(carDiv);
		form.insertBefore(carsContainer, form.elements['time_departure'].parentNode);
	}
	//adds to form list new car to calculate
	function addNewCar (arguments) {
		var carsContainer = document.getElementById('cars-container'),
		    carsDivClone = carsContainer.children[0].cloneNode(true);
		carsDivClone.children[0].textContent = "Авто №" + (++amountOfAdditionalCars);
		carsDivClone.children[3].children[0].children[3].selected = true;
		carsDivClone.children[4].children[0].checked = false;
		carsDivClone.children[5].children[0].checked = false;
		carsDivClone.dataset.additionalCarNum = amountOfAdditionalCars;
		carsContainer.appendChild(carsDivClone);
		
	}

	//adds and replace 'add' button
	function addButton (arguments) {
		var addButton = document.createElement('button');
		addButton.textContent = 'Добавить еще авто';
		addButton.id = 'add-car-button';
		addButton.type = 'button';
		addButton.addEventListener('click', function(){addNewCar(); clearFinalPrice ();}, false);
		form.insertBefore(addButton, form.elements['time_departure'].parentNode);
	}

	function removeCarContainer (arguments) {
		var carsContainer = document.getElementById('additional-cars');
		if (carsContainer) form.removeChild(carsContainer);
	}

	function removeAddButton (arguments) {
		var button = document.getElementById('add-car-button');
		if (button) form.removeChild(button);
	}

	function calculatePrice () {
		var repairSelect    = document.getElementById('damage_type');
		var finalPriceField = document.getElementById('final_price');
		var carPriceRatio, wheelPrice, wheelsCount, finalPrice, departure, outMkadKm, changeType, oneCarCost = 0, tireFullChange = 0;

		//Собираем значения из полей
		
		if (repairTire) {
			wheelsCount 	= 1;
			carPriceRatio = form.elements['car_type'].value == 'light' ? _NORMAL_RATIO : _SUV_RATIO;

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

			wheelPrice    = _ONE_WHEEL_SET_PRICE[ form.elements['tyre_size'].value ]['fullPrice'];
			outMkadKm	  	= form['out_MKAD_km'].value * _KM_OUT_MKAD;
			patchPrice    = (repairTire) ? 
			_PATCH_PRICE_AND_DESCRIPTION[ form.elements['damage_type'].value ].price : 0;
			finalPrice    = (wheelPrice * wheelsCount) * carPriceRatio + departure + patchPrice + outMkadKm;
		} 

		if (changeTire) {
			let carsContainer = document.getElementById('cars-container').children;
			for (var i = 0; i < carsContainer.length; i++) {
				let additionalCar = carsContainer[i].children;
				carPriceRatio = additionalCar[1].children[0].value == 'light' ? _NORMAL_RATIO : _SUV_RATIO;
				changeType = additionalCar[4].children[0].checked == false ? 'fullPrice' : 'onWheel';
				wheelPrice = _ONE_WHEEL_SET_PRICE[additionalCar[2].children[0].value][changeType];
				wheelsCount = parseInt(additionalCar[3].children[0].value);
				if (additionalCar[5].children[0].checked && changeType == 'fullPrice') carPriceRatio += .2;
 				//add minimal costs for 'onWheel' tire change
				if(changeType === 'onWheel' && carPriceRatio === 1) {
					oneCarCost = 7.5 * wheelsCount;
				}else if (changeType === 'onWheel' && carPriceRatio === 1.2){
					oneCarCost = 8.75 * wheelsCount;
				}else {
					oneCarCost += (wheelPrice * wheelsCount) * carPriceRatio;
				}

				if (changeType == 'fullPrice') tireFullChange += 1;
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
			outMkadKm  = form['out_MKAD_km'].value * _KM_OUT_MKAD;
			if(tireFullChange >= 3) {
				departure = 0;
			}
			finalPrice = oneCarCost + departure + outMkadKm;

		}

		if (changeStepney) {
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
		finalPriceField.innerHTML = "Итого <strong>" + finalPrice[0] + 
		"</strong> руб. <strong>" + finalPrice[1] + "</strong> коп. *";
		finalPriceField.style.opacity = 1;
		finalPriceField.classList.add('bounceInRight');
	}
	//Чистим поле с ценой, каждый раз, когда изменяется поле формы
	function clearFinalPrice () {
		var totalPrice = document.getElementById('final_price');
		totalPrice.style.opacity = 0;
		totalPrice.classList.remove('bounceInRight');
		totalPrice.ontransitionend = function () {totalPrice.textContent = ''};
	}

	setListeners();
	renderListOfServices ();
 


})();
