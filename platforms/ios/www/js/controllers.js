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
   
.controller('statsCtrl', function($scope) {

})
   
.controller('moreCtrl', function($scope) {

})
      
.controller('addSymbolCtrl', function($scope, Stocks, $stateParams) {
	$scope.buyButton = true;

	$scope.stock = {};

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
	}

	$scope.setStockQty = function setStockQty(qty) {
		$scope.stock.qty = qty;
		$scope.calcTotal();
	};

	$scope.toggleBuyButton = function toggleBuyButton() {
		$scope.buyButton = !$scope.buyButton;
	};

	$scope.createStock = function createStock(stock) {
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

})
 