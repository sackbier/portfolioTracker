angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.portfolio', {
        cache: false,
    url: '/portfolio',
    views: {
      'tab1': {
        templateUrl: 'templates/portfolio.html',
        controller: 'portfolioCtrl'
      }
    }
  })

  .state('tabsController.stats', {
    url: '/stats',
    views: {
      'tab3': {
        templateUrl: 'templates/stats.html',
        controller: 'statsCtrl'
      }
    }
  })

  .state('tabsController.stockDetail', {
    url: '/stockDetail/:stockId',
    views: {
      'tab3': {
        templateUrl: 'templates/stockDetail.html',
        controller: 'stockDetailCtrl'
      }
    }
  })

  .state('tabsController.more', {
    url: '/more',
    views: {
      'tab4': {
        templateUrl: 'templates/more.html',
        controller: 'moreCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('tabsController.addSymbol', {
    url: '/add',
    views: {
      'tab1': {
        templateUrl: 'templates/addSymbol.html',
        controller: 'addSymbolCtrl'
      }
    }
  })

  .state('tabsController.editSymbol', {
    url: '/edit/:stockId',
    views: {
      'tab1': {
        templateUrl: 'templates/addSymbol.html',
        controller: 'addSymbolCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/page1/portfolio')

  

});