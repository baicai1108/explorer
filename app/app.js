// app.js - 兼容Angular 1.4.5版本
(function() {
    'use strict';
    
    console.log('开始加载app.js');
    console.log('Angular版本:', angular.version.full);
    
    // 检查版本兼容性
    var angularVersion = angular.version.full.split('.').map(Number);
    var isOldVersion = angularVersion[0] === 1 && angularVersion[1] < 6;
    
    if (isOldVersion) {
        console.warn('检测到较旧的Angular版本:', angular.version.full);
    }
    
    // 创建模块
    var app;
    try {
        app = angular.module('ethExplorer', ['ngRoute']);
        console.log('模块创建成功');
    } catch(e) {
        console.error('创建模块失败:', e);
        return;
    }
    
    // 路由配置
    app.config(['$routeProvider', function($routeProvider) {
        console.log('配置路由');
        
        $routeProvider
            .when('/', {
                template: '<h1>私有链浏览器</h1>' +
                         '<div class="alert" ng-class="{\'alert-success\': connected, \'alert-warning\': !connected}">' +
                         '    <span ng-if="connected">✅ 已连接到节点</span>' +
                         '    <span ng-if="!connected">⚠️ 未连接到节点</span>' +
                         '    <button ng-click="checkConnection()" class="btn btn-sm" ng-class="{\'btn-success\': connected, \'btn-warning\': !connected}">刷新</button>' +
                         '</div>',
                controller: 'MainController'
            })
            .when('/block/:blockId', {
                template: '<h2>区块 #{{blockId}}</h2>' +
                         '<div ng-if="loading">加载中...</div>' +
                         '<div ng-if="block">{{block | json}}</div>',
                controller: 'BlockController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
    
    // 运行块
    app.run(['$rootScope', '$http', function($rootScope, $http) {
        console.log('应用运行');
        
        $rootScope.connected = false;
        $rootScope.blockNumber = 0;
        
        $rootScope.checkConnection = function() {
            console.log('检查连接...');
            
            $http({
                method: 'POST',
                url: 'http://localhost:8545',
                data: {
                    jsonrpc: "2.0",
                    method: "eth_blockNumber",
                    params: [],
                    id: 1
                },
                timeout: 3000
            }).then(function(response) {
                console.log('连接成功:', response.data);
                if (response.data && response.data.result) {
                    $rootScope.connected = true;
                    $rootScope.blockNumber = parseInt(response.data.result, 16);
                }
            }).catch(function(error) {
                console.log('连接失败:', error);
                $rootScope.connected = false;
            });
        };
        
        // 初始检查
        $rootScope.checkConnection();
    }]);
    
    // 控制器
    app.controller('MainController', ['$scope', '$rootScope', function($scope, $rootScope) {
        console.log('MainController加载');
        $scope.connected = $rootScope.connected;
        $scope.checkConnection = $rootScope.checkConnection;
    }]);
    
    app.controller('BlockController', ['$scope', '$routeParams', function($scope, $routeParams) {
        console.log('BlockController加载');
        $scope.blockId = $routeParams.blockId;
        $scope.loading = false;
    }]);
    
    console.log('app.js加载完成');
})();