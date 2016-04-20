angular.module('app.controllers', [])
  
.controller('portfolioCtrl', function($scope, Stocks, $ionicActionSheet) {

	$scope.showEditButton = true;
	$scope.showDeleteButton = false;

	$scope.stocks = Stocks.all();

	$scope.deleteStock = function deleteStock(stockId) {

		   // Show the action sheet
		   var hideSheet = $ionicActionSheet.show({
		     titleText: "Realy delete this stock?",
		     destructiveText: "Delete",
		     destructiveButtonClicked: function() {
		     	delete $scope.stocks.data[stockId];
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
   
.controller('statsCtrl', function($scope, Stocks) {
	$scope.stocks = Stocks.all().data;
	$scope.totalProfit = 0;

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

	// custom time frame equals current month
	startEndDate.cu = startEndDate.mo;

	console.log(startEndDate);

	$scope.selectedTimeFrame = "yr";

	$scope.selectTimeFrame = function selectTimeFrame(timeFrame) {
		$scope.selectedTimeFrame = timeFrame;
		$scope.calculateProfit();
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
					console.log("add profit, now:", totalProfit);
				}

			}
		}

		$scope.totalProfit = totalProfit;
	};

	$scope.calculateProfit();

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
	$scope.buyButton = true;
	$scope.symbolList = false;

	$scope.stock = {};
	$scope.stock.isSold = false;

	var isNewStock = true;

	var stocks = Stocks.all();


	$scope.calcTotal = function calcTotal() {
		if(typeof $scope.stock.price === "undefined" || typeof $scope.stock.qty === "undefined") {
			return;
		} else {
			$scope.stock.total = $scope.stock.price * $scope.stock.qty;
		}
	};

	if($stateParams.stockId) {
		console.log("load id #", $stateParams.stockId);
		$scope.stock = stocks.data[$stateParams.stockId];
		isNewStock = false;
		$scope.calcTotal();
		if($scope.stock.isSold) $scope.buyButton = false;
		$scope.stock.sellDate = $filter('date')($scope.stock.sellDate,'short');
	}

	$scope.setStockQty = function setStockQty(qty) {
		$scope.stock.qty = qty;
		$scope.calcTotal();
	};

	$scope.toggleBuyButton = function toggleBuyButton() {
		$scope.buyButton = !$scope.buyButton;
		$scope.stock.isSold = !$scope.stock.isSold;
		$scope.stock.sellDate = $filter('date')(Date.now(),'short');
	};

	$scope.closeSymbolList = function closeSymbolList() {
		if($scope.symbolList) $scope.symbolList = false;
		$scope.symbolLookup = {};
	}

	$scope.setSymbol = function setSymbol(symbol) {
		$scope.stock.symbol = symbol;
	}


	$scope.createStock = function createStock(stock) {

		stock = formatStockDate(stock);

		// if new stock, create
		if(isNewStock) {
			stocks.data[Stocks.getId(stocks)] = Stocks.newStock(stock);
			Stocks.save(stocks);
		} 
		// update stock, if it already exists
		else {
			stocks.data[$stateParams.stockId] = stock;
			Stocks.save(stocks);
		}
	};

	function formatStockDate(stock) {
		date = stock.sellDate;
		formatedDate = new Date(date);
		stock.sellDate = formatedDate.getTime();
		return stock;
	}

	var scheduledRequest = null;

	$scope.symbolLookup = {};

	$scope.getSymbol = function getSymbol() {

		if(scheduledRequest) {
			$timeout.cancel(scheduledRequest);
		}

		scheduledRequest = $timeout(function fetchData() {
			// get the data (promise) from the server
			StockApi.getQuote($scope.stock.symbol)
			.then(
				// if there is actual data make it available to the label in $scope
				function setSymbolLabel(data) {
					$scope.symbolLookup = data.slice(0,5);
					// show the label
					if(!$scope.symbolList) $scope.symbolList = true;
			}, 
				// handle errors with the data and set the label to empty
				function handleErrors(err) {
					console.log("There is a problem with the data:\n",err);
					$scope.symbolLookup = {};
			});

		}, 800);
	};
	

})
 