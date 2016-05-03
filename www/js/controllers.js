angular.module('app.controllers', [])
  
.controller('portfolioCtrl', function($scope, Stocks, $ionicActionSheet) {

	$scope.showEditButton = true;
	$scope.showDeleteButton = false;

	$scope.stocks = Stocks.all();
	$scope.unsoldStocks = {};

	for(var id in $scope.stocks.data) {
		var stock = $scope.stocks.data[id];
		if(!stock.isSold) {
			$scope.unsoldStocks[id] = stock;
		}
	}

	$scope.deleteStock = function deleteStock(stockId) {

	   // Show the action sheet
	   var hideSheet = $ionicActionSheet.show({
	     titleText: "Realy delete this stock?",
	     destructiveText: "Delete",
	     destructiveButtonClicked: function() {
	     	delete $scope.stocks.data[stockId];
	     	delete $scope.unsoldStocks[stockId];
			Stocks.save($scope.stocks);
			return true;
	     },
	     cancelText: "Cancel",
	   });
				
	};

	$scope.toggleDeleteButton = function toggleDeleteButton() {
		console.log("toggle delete");
		$scope.showDeleteButton = !$scope.showDeleteButton;
		$scope.showEditButton = !$scope.showEditButton;
	};

	$scope.formatNumber = function formatNumber(num) {
		return parseFloat(Math.round(num * 100) / 100).toFixed(2);
	};

})
   
.controller('statsCtrl', function($scope, Stocks, $filter) {
		
	//--------------------------------------------------------
	//### SCOPE VARIABLES ####################################
	//--------------------------------------------------------

	$scope.stocks = Stocks.all().data;
	$scope.relevantStocks = {};
	$scope.totalProfit = 0;

	$scope.selectedTimeFrame = "yr";

	// DATE INFO
	// current year and month
	var date = new Date();
	var currentYear = date.getFullYear();
	var currentMonth = date.getMonth();
	
	// current week
	var today = new Date();
	today.setHours(0,0,0,0);
	var firstDayOfWeek = today.getDate() - today.getDay();
	var currentWeekStart = new Date(today.setDate(firstDayOfWeek));
	var currentWeekEnd = new Date(today.setDate(firstDayOfWeek + 7));

	var startEndDate = {
		yr: {
			start: new Date(currentYear,0),
			end: new Date(currentYear,12,1)
		},
		mo: {
			start: new Date(currentYear,currentMonth),
			end: new Date(currentYear,currentMonth+1,1)
		},
		wk: {
			start: currentWeekStart,
			end: currentWeekEnd
		},
	};

	$scope.selectedTimeFrameName = selectTimeFrameName();

	// custom time frame equals current month
	startEndDate.cu = startEndDate.mo;

	updateRelevantStocks();

	function updateRelevantStocks() {
		var startDate = startEndDate[$scope.selectedTimeFrame].start.getTime();
		var endDate= startEndDate[$scope.selectedTimeFrame].end.getTime();

		$scope.relevantStocks = {};

		// get only sold stocks
		for(var id in $scope.stocks) {
			var stock = $scope.stocks[id];
			if(stock.isSold && stock.sellDate<endDate && stock.sellDate>startDate) {
				$scope.relevantStocks[id] = $scope.stocks[id];
			}
		}

		console.log("STOCKS:", $scope.relevantStocks);
	}

	$scope.selectTimeFrame = function selectTimeFrame(timeFrame) {
		$scope.selectedTimeFrame = timeFrame;
		$scope.calculateProfit();
		$scope.selectedTimeFrameName = selectTimeFrameName();
		updateRelevantStocks();
	};

	$scope.calculateProfit = function calculateProfit() {
		var startDate = startEndDate[$scope.selectedTimeFrame].start.getTime();
		var endDate= startEndDate[$scope.selectedTimeFrame].end.getTime();
		var totalProfit = 0;

		for (var id in $scope.stocks) {
		    // skip loop if the property is from prototype
		    if (!$scope.stocks.hasOwnProperty(id)) continue;

		    var stock = $scope.stocks[id];
			
			if(stock.isSold) {
				if(stock.sellDate<endDate && stock.sellDate>startDate) {
					totalProfit = totalProfit + (stock.sellPrice - stock.price)*stock.qty;
				}

			}
		}

		$scope.totalProfit = totalProfit;
	};

	$scope.calculateProfit();

	function selectTimeFrameName() {

		var startDate = startEndDate[$scope.selectedTimeFrame].start;
		var endDate = startEndDate[$scope.selectedTimeFrame].end;

		switch($scope.selectedTimeFrame) {
			
			case "yr":
				return "in " + startDate.getFullYear();
			case "mo":
				return "in " + $filter('date')(startDate,'MMMM');
			case "wk":
				return "in week from " + $filter('date')(startDate,'M/d/yy');
			case "cu":
				return "from " + $filter('date')(startDate,'M/d/yy') + " to " + $filter('date')(endDate,'M/d/yy');
		}

	}

})

.controller('stockDetailCtrl', function($scope, Stocks, $stateParams) {

	if($stateParams.stockId) {
		$scope.stock = Stocks.all().data[$stateParams.stockId];
	} else {
		$scope.stock = {};
	}

})
   
.controller('moreCtrl', function($scope) {

})
      
.controller('addSymbolCtrl', function($scope, Stocks, StockApi, $stateParams, $http, $timeout, $filter) {
	
	//--------------------------------------------------------
	//### SCOPE VARIABLES ####################################
	//--------------------------------------------------------

	$scope.buyButton = true;
	$scope.symbolList = false;

	$scope.stock = {};
	$scope.stock.isSold = false;

	$scope.symbolLookup = {};

	//--------------------------------------------------------
	//### OTHER VARIABLES ####################################
	//--------------------------------------------------------

	var stocks = Stocks.all();

	var scheduledRequest = null;

	var isNewStock; // gets initized below
	
	//--------------------------------------------------------
	//### SCOPE FUNCTIONS ####################################
	//--------------------------------------------------------

	$scope.calcTotal = function calcTotal() {
		if(typeof $scope.stock.price === "undefined" || typeof $scope.stock.qty === "undefined") {
			return;
		} else {
			$scope.stock.total = $scope.stock.price * $scope.stock.qty;
		}
	};

	$scope.setStockQty = function setStockQty(qty) {
		$scope.stock.qty = qty;
		$scope.calcTotal();
	};

	$scope.toggleBuyButton = function toggleBuyButton() {
		$scope.buyButton = !$scope.buyButton;
		$scope.stock.isSold = !$scope.stock.isSold;
		if(!$scope.stock.sellDate) {
			$scope.stock.sellDate = new Date();
		}
	};

	$scope.closeSymbolList = function closeSymbolList() {
		if($scope.symbolList) $scope.symbolList = false;
		$scope.symbolLookup = {};
	}

	$scope.setSymbol = function setSymbol(symbol) {
		$scope.stock.symbol = symbol;
	}

	$scope.createStock = function createStock(stock) {
	// this is for both creating and updating a stock

		// replace date string by a real Date object
		// so it can be displayed nicely
		stock = formatStockDate(stock);

		// if new stock, create
		if(!isNewStock) {
			stocks.data[Stocks.getId(stocks)] = Stocks.newStock(stock);
			Stocks.save(stocks);
		} 
		// update stock, if it already exists
		else {
			stocks.data[$stateParams.stockId] = stock;
			Stocks.save(stocks);
		}
	};

	$scope.getSymbol = function getSymbol() {

		// cancel old request when there is one pending
		if(scheduledRequest) {
			$timeout.cancel(scheduledRequest);
		}

		// wait some time before sending the request
		// (wait, if there is more user input)
		scheduledRequest = $timeout(fetchData, 800);

		function fetchData() {
			// get the data (promise) from the server
			StockApi.getQuote($scope.stock.symbol)
			.then(setSymbolLabel, handleErrors);
		}

		function setSymbolLabel(data) {
		// if there is actual data make it available to the label in $scope
			$scope.symbolLookup = data.slice(0,5);
			// show the label
			if(!$scope.symbolList) $scope.symbolList = true;
		}

		function handleErrors(err) {
		// handle errors with the data and set the label to empty
			console.log("There is a problem with the data:\n",err);
			$scope.symbolLookup = {};
		}
	};

	//--------------------------------------------------------
	//### UTILITY FUNCTIONS ##################################
	//--------------------------------------------------------

	isNewStock = checkIsNewStock();

	function formatStockDate(stock) {
		date = stock.sellDate;
		formatedDate = new Date(date);
		stock.sellDate = formatedDate.getTime();
		return stock;
	}

	function checkIsNewStock() {
	// checks the url parameters for a stock id
	// if there is one the corresponding stock is loaded
		if($stateParams.stockId) {
			$scope.stock = stocks.data[$stateParams.stockId];
			$scope.calcTotal();
			if($scope.stock.isSold) $scope.buyButton = false;
			$scope.stock.sellDate = new Date($scope.stock.sellDate) //$filter('date')($scope.stock.sellDate,'dd.MM.yyyy');
			return true;
		} else {
			return false;
		}
	}
	

})
 