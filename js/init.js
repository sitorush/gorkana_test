var model = new Gorkana.ListModel(),

	controller = new Gorkana.ListController(model),
	
	view = new Gorkana.ListView(model, controller, {
		addButton : 'btn_input_1',
		input : 'txt_input_1',
		wrapper : 'wrapper',
		total : 'txt_total'
	});