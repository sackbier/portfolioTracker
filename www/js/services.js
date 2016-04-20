var stockPorfolioServices = angular.module('app.services', []);

stockPorfolioServices.factory('Stocks', [function(){
	return {

		// returns all stocks from the local storage
		// or a new stocks object
	    all: function() {
	      var projectString = window.localStorage['stocks'];

	      // check if stocks are in the storage and if so, return them
	      if(projectString) {
	        return angular.fromJson(projectString);

	      }

	      // Basick "Stocks" MODEL
	      // no stocks in storage: return new object
	      // including an initial nextId and empty data object
	      return {
	      	nextId: 0,
	      	data: {},
	      };
	    },

	    // returns the next Id for a stocks object and increments it
	    getId: function getId(stocks) {
	      		return stocks.nextId++;
	    },

	    // takes a stocks object and saves it to the storage
	    save: function(stocks) {
	      window.localStorage['stocks'] = angular.toJson(stocks);
	    },

	    // constructs a stock object
	    // takes the basic info from a given object and adds aditional fields
	    newStock: function(stock) {
	    	if(stock.isSold) {
	    		stock.sellDate = Date.now() - (1000*60*60*24*30);
	    		// for testing time frames; Date.now()
	    	} else {
	    		stock.sellDate = null;
	    	}
	      	return {
		        symbol: stock.symbol,
		        price: stock.price,
		        qty: stock.qty,
		        sellPrice: stock.sellPrice,
		        sellDate: stock.sellDate,
		        isSold: stock.isSold,
		        buyDate: Date.now(),

	      	};
    	},

	};
}]);

stockPorfolioServices.factory('StockApi', ['$timeout', '$http', function($timeout, $http) {
	return {

		getQuote: function getQuote(stockSymbol) {

			function request() {
				// API MOCK!!!
				var url = "http://localhost:8000/api.json?query=" + stockSymbol + "&region=US&lang=en-US";

				var requestPromise = $http({
					method: "GET",
					url: url,
				});

				console.log("requesting data");

				return requestPromise;
			}

			function handleData(data) {

				return new Promise(function(resolve,reject) {
					
					var dataSet = data.data.ResultSet.Result;

					if(typeof dataSet === "undefined") {
						reject(Error("No data found"));
					} else {
						resolve(dataSet);
					}
				});
			}

			function handleErrors(err) {
				console.log("Following errors occured while fetching the data:\n",err.status,err.statusText);
			}

			return request().then(handleData, handleErrors);

		}
	};

}]);

