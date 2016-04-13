angular.module('app.services', [])

.factory('Stocks', [function(){
	return {
	    all: function() {
	      var projectString = window.localStorage['stocks'];
	      if(projectString) {
	        return angular.fromJson(projectString);

	      }
	      console.log("new Storage!");
	      return {
	      	nextId: 0,
	      	data: {},
	      };
	    },

	    getId: function getId(stocks) {
	      		return stocks.nextId++;
	    },

	    save: function(stocks) {
	      window.localStorage['stocks'] = angular.toJson(stocks);
	    },

	    newStock: function(stock) {
	      	return {
		        symbol: stock.symbol,
		        price: stock.price,
		        qty: stock.qty,
		        sellPrice: stock.sellPrice,
		        isSold: stock.isSold,
		        buyDate: Date.now(),

	      	};
    	},

	};
}])

