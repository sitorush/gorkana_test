/**
 * @fileoverview Gorkana Javascript Test - demo of Object Oriented & Observer Pattern
 * @author Tom Marulak - tom@sitorus-internet.com
 */

/**
 * Implement/copy source object properties into base function prototype
 * @param {Object} o source object
 */

if(typeof Function.implement === 'undefined'){
	Function.prototype.implement = function(o){
		for (i in o) {
			if(o.hasOwnProperty(i)){
				this.prototype[i] = o[i];
			}
		}
	}
}

/**
 * Define Gorkana NameSpace
 * @namespace Gorkana
 */

var Gorkana = Gorkana || {};

/**
 * Observer Pattern
 */

Gorkana.Observe = {
	
	/**
	 * Object to store the events collection
	 */
	events : {
		any : []
	},
    
	/**
	 * Add an event type into collection 
	 * @param {String} name of the event
	 * @param {Function} func the handler
	 * @param {Object} context
	 */
    attach : function(name, func, context){
		if (typeof this.events[name] === "undefined") 
			this.events[name] = [];
			
        this.events[name].push({
			func: func,
			context: context || this
		});
		
		return this;
    },
    
	/**
	 * Execute an event by calling its name
	 * @param {String} type of event that will be notified
	 * @param {Array} args argument
	 */
    notify : function(type, args){
		var pubtype = type || 'any',
            subscribers = this.events[pubtype],
            i,
            max = subscribers ? subscribers.length : 0;

        for (i = 0; i < max; i += 1) {
			subscribers[i].func.apply(subscribers[i].context, args);
        }
		
		return this;
    }

};

/**
 * Model Object - this will handle how to store, remove, and return a data collection
 * @constructor 
 * @param {Array} items default value 
 */
 
Gorkana.ListModel = function(items){
    this.items = items || [];
	this.items = this.items.concat(this.getLocalStorage());
};

Gorkana.ListModel.prototype = {
	
	/**
	 * @desc add item into data collection
	 * @param {Object} item
	 */
    addItem : function(item){
		
    	if(item == '') return false;
        
		this.items.push(item);
		this.updateLocalStorage();
		this.notify('itemAdded');
    
    },
    
	/**
	 * @desc remove item from data collection 
	 * @param {Int} index
	 */
    removeItem : function(index){      
        var item = this.items[index];
        this.items.splice(index, 1);
		this.updateLocalStorage();
		this.notify('itemRemoved');
    },
	
	/**
	 * @return {Array} data collection
	 */
    getItems : function(){
        return this.items;
    },
    
	/**
	 * @return {Int} length of items
	 */
    getTotal : function(){
        return this.items.length;
    },
	
	/**
	 * @desc Update local storage data, when user refreshes the page the list data will persist
	 * @return this Object when localStorage detected, false otherwise
	 */
	updateLocalStorage : function(){
		if(!window.localStorage) return false;
		localStorage.setItem("G_Items", this.items);
		return this;
	},
	
	/**
	 * @desc get local storage data in array, if empty string is found empty array will be returned
	 */
	getLocalStorage : function(){
		if(!window.localStorage) return false;
		return localStorage.getItem("G_Items") !== '' && localStorage.getItem("G_Items") !== null ? localStorage.getItem("G_Items").split(',') : [];
	}

}
/**
 * @desc Mixin properties inheritance
 */
Gorkana.ListModel.implement(Gorkana.Observe);

/**
 * @desc ListController 
 * @param {Object} model
 */

Gorkana.ListController = function(model){
	this.model = model;
}

Gorkana.ListController.prototype = {
	
	/**
	 * @desc Logic for adding item into model
	 * @param {String} item
	 */
	addItem : function(item){
		this.model.addItem(item);
	},
	
	/**
	 * @desc logic for removing item from model
	 * @param {Int} index
	 */
	removeItem : function(index){
		this.model.removeItem(index);
	}
	
}

/**
 * @param {Object} model
 * @param {Object} controller
 * @param {Object} 
 * elms.addButton -  element id add button, 
 * elms.input -  element id text input, 
 * elms.wrapper - wrapper element id where to append the list item, 
 * elms.total - element id for total text
 */

Gorkana.ListView = function(model, controller, elms){
	
	this.model = model;
    this.controller = controller;
	
	this.config = {
		alertTxt : "Please fill the textbox..",
		deleteTxt : "Delete",
		deleteClass : "btn_delete"
	}

	if (typeof elms === 'object') {

		this.button = document.getElementById(elms.addButton);
		this.input = document.getElementById(elms.input);
		this.wrapper = document.getElementById(elms.wrapper);
		this.total = document.getElementById(elms.total);
		
		function addItem() {
			if (this.input.value === "") {
				alert(this.config.alertTxt);
				return false;
			}
			
			this.controller.addItem(this.input.value);
			this.input.value = '';
		};
		
		this.button.onclick = addItem.bind(this);
		this.input.onkeypress = function(e){
    		if (e.keyCode == 13){
				addItem.call(this);
				return false;
			}
		}.bind(this);
	}
	
	this.model
		.attach('itemAdded', this.buildListItem.bind(this))
		.attach('itemRemoved', this.buildListItem.bind(this));
	
	this.buildListItem();
}

Gorkana.ListView.prototype = {
	
	/**
	 * @desc HTML list item builder
	 */
	buildListItem : function(){
		var content = '',
			items = this.model.getItems();
			
		if (!items.length) {
			this.wrapper.innerHTML = content;
			this.updateTotal();
			return false;
		}
		
		content += "<ul>";

		for(var i = 0; i < items.length; i++){
			content += "<li>" + items[i] + "  <button data-index=\"" + i + "\" class=\"" + this.config.deleteClass + "\">" + this.config.deleteTxt + "</button></li>"
		};
		
		content += "</ul>";
		
		this.wrapper.innerHTML = content;
		
		this.attachListener()
			.updateTotal();
	},
	
	/**
	 * @desc Update element text for total list
	 */
	updateTotal : function(){
		var qty = this.model.getTotal(),
			pluralize = qty < 2 ? " item " : " items ";
			
		this.total.innerHTML = qty + pluralize + "in the list.";
		
		return this;
	},
	
	/**
	 * @desc attach a click listener to delete buttons
	 */
	attachListener : function(){
		var deleteButtons = document.getElementsByClassName(this.config.deleteClass);
		
		for(var i = 0; i < deleteButtons.length; i++){
			deleteButtons[i].onclick = function(e){
				this.controller.removeItem(e.target.getAttribute("data-index"))
				return false;
			}.bind(this)
		}
		
		return this;
	}
}