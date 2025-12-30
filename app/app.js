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
    
    // 配置常量
    app.constant('AppConfig', {
        nodeUrl: 'http://localhost:8545',
        refreshInterval: 30000, // 30秒
        connectionTimeout: 5000
    });
    
    // 路由配置
    app.config(['$routeProvider', function($routeProvider) {
        console.log('配置路由');
        
        $routeProvider
            .when('/', {
                template: '<div>' +
                         '  <div class="alert" ng-class="{\'alert-success\': connected, \'alert-warning\': !connected}" style="margin-top:20px;">' +
                         '    <div style="display:flex; justify-content:space-between; align-items:center;">' +
                         '      <div>' +
                         '        <span ng-if="connected">✅ 已连接到私有链节点</span>' +
                         '        <span ng-if="!connected">⚠️ 未连接到私有链节点</span>' +
                         '        <span style="margin-left:10px;" ng-if="connected">当前区块: <strong>{{blockNumber}}</strong></span>' +
                         '      </div>' +
                         '      <button ng-click="checkConnection()" class="btn btn-sm" ng-class="{\'btn-success\': connected, \'btn-warning\': !connected}">刷新连接</button>' +
                         '    </div>' +
                         '  </div>' +
                         '  <div class="panel panel-default" ng-if="latestBlock">' +
                         '    <div class="panel-heading"><h3 class="panel-title">最新区块信息</h3></div>' +
                         '    <div class="panel-body">' +
                         '      <div class="row">' +
                         '        <div class="col-md-6">' +
                         '          <p><strong>区块高度:</strong> {{latestBlock.number}}</p>' +
                         '          <p><strong>矿工地址:</strong> <span class="monospace">{{latestBlock.miner}}</span></p>' +
                         '          <p><strong>难度:</strong> {{latestBlock.difficulty}}</p>' +
                         '        </div>' +
                         '        <div class="col-md-6">' +
                         '          <p><strong>交易数量:</strong> {{latestBlock.transactions ? latestBlock.transactions.length : 0}}</p>' +
                         '          <p><strong>时间戳:</strong> {{(latestBlock.timestamp * 1000) | date:\'yyyy-MM-dd HH:mm:ss\'}}</p>' +
                         '          <p><strong>Gas 限制:</strong> {{latestBlock.gasLimit}}</p>' +
                         '        </div>' +
                         '      </div>' +
                         '      <div class="row">' +
                         '        <div class="col-md-12">' +
                         '          <p><strong>区块哈希:</strong> <span class="monospace">{{latestBlock.hash}}</span></p>' +
                         '          <p><strong>父区块哈希:</strong> <span class="monospace">{{latestBlock.parentHash}}</span></p>' +
                         '        </div>' +
                         '      </div>' +
                         '    </div>' +
                         '  </div>' +
                         '  <div class="text-center" ng-if="loading">' +
                         '    <div class="spinner-border text-primary" role="status">' +
                         '      <span class="sr-only">加载中...</span>' +
                         '    </div>' +
                         '    <p>加载中...</p>' +
                         '  </div>' +
                         '</div>',
                controller: 'MainController'
            })
            .when('/block/:blockId', {
                template: '<div>' +
                         '  <h2>区块详情 #{{blockId}}</h2>' +
                         '  <div class="text-center" ng-if="loading">' +
                         '    <div class="spinner-border text-primary" role="status">' +
                         '      <span class="sr-only">加载中...</span>' +
                         '    </div>' +
                         '    <p>加载中...</p>' +
                         '  </div>' +
                         '  <div ng-if="blockDetail && !loading">' +
                         '    <div class="panel panel-default">' +
                         '      <div class="panel-heading">' +
                         '        <h3 class="panel-title">区块信息</h3>' +
                         '      </div>' +
                         '      <div class="panel-body">' +
                         '        <div class="row">' +
                         '          <div class="col-md-6">' +
                         '            <p><strong>区块高度:</strong> {{blockDetail.number | hexToDecimal}}</p>' +
                         '            <p><strong>区块哈希:</strong> <span class="monospace">{{blockDetail.hash}}</span></p>' +
                         '            <p><strong>矿工地址:</strong> <span class="monospace">{{blockDetail.miner}}</span></p>' +
                         '          </div>' +
                         '          <div class="col-md-6">' +
                         '            <p><strong>难度:</strong> {{blockDetail.difficulty | hexToDecimal}}</p>' +
                         '            <p><strong>时间戳:</strong> {{blockDetail.timestamp | timestampToDate}}</p>' +
                         '            <p><strong>Gas 限制:</strong> {{blockDetail.gasLimit | hexToDecimal}}</p>' +
                         '          </div>' +
                         '        </div>' +
                         '        <h4>交易列表 ({{blockDetail.transactions ? blockDetail.transactions.length : 0}} 笔)</h4>' +
                         '        <div ng-if="blockDetail.transactions && blockDetail.transactions.length > 0">' +
                         '          <table class="table table-striped">' +
                         '            <thead>' +
                         '              <tr>' +
                         '                <th>交易哈希</th>' +
                         '                <th>发送方</th>' +
                         '                <th>接收方</th>' +
                         '              </tr>' +
                         '            </thead>' +
                         '            <tbody>' +
                         '              <tr ng-repeat="tx in blockDetail.transactions">' +
                         '                <td><span class="monospace">{{tx.hash ? (tx.hash.substring(0, 16) + \'...\') : \'N/A\'}}</span></td>' +
                         '                <td><span class="monospace">{{tx.from ? (tx.from.substring(0, 12) + \'...\') : \'N/A\'}}</span></td>' +
                         '                <td><span class="monospace">{{tx.to ? (tx.to.substring(0, 12) + \'...\') : \'合约创建\'}}</span></td>' +
                         '              </tr>' +
                         '            </tbody>' +
                         '          </table>' +
                         '        </div>' +
                         '        <div ng-if="!blockDetail.transactions || blockDetail.transactions.length === 0">' +
                         '          <p>此区块没有交易</p>' +
                         '        </div>' +
                         '      </div>' +
                         '    </div>' +
                         '    <button class="btn btn-default" onclick="window.history.back()">返回</button>' +
                         '  </div>' +
                         '  <div ng-if="!blockDetail && !loading">' +
                         '    <div class="alert alert-warning">' +
                         '      区块不存在或加载失败' +
                         '    </div>' +
                         '    <button class="btn btn-default" onclick="window.history.back()">返回</button>' +
                         '  </div>' +
                         '</div>',
                controller: 'BlockController'
            })
            .when('/transaction/:txHash', {
                template: '<div>' +
                         '  <h2>交易详情</h2>' +
                         '  <p><small class="monospace">{{txHash}}</small></p>' +
                         '  <div class="text-center" ng-if="loading">' +
                         '    <div class="spinner-border text-primary" role="status">' +
                         '      <span class="sr-only">加载中...</span>' +
                         '    </div>' +
                         '    <p>加载中...</p>' +
                         '  </div>' +
                         '  <div ng-if="transaction && !loading">' +
                         '    <div class="panel panel-default">' +
                         '      <div class="panel-heading">' +
                         '        <h3 class="panel-title">交易信息</h3>' +
                         '      </div>' +
                         '      <div class="panel-body">' +
                         '        <div class="row">' +
                         '          <div class="col-md-6">' +
                         '            <p><strong>交易哈希:</strong> <span class="monospace">{{transaction.hash}}</span></p>' +
                         '            <p><strong>发送方:</strong> <span class="monospace">{{transaction.from}}</span></p>' +
                         '            <p><strong>接收方:</strong> <span class="monospace">{{transaction.to || \'合约创建\'}}</span></p>' +
                         '          </div>' +
                         '          <div class="col-md-6">' +
                         '            <p><strong>区块:</strong> {{transaction.blockNumber | hexToDecimal}}</p>' +
                         '            <p><strong>价值:</strong> {{transaction.value | weiToEther}}</p>' +
                         '            <p><strong>Gas:</strong> {{transaction.gas | hexToDecimal}}</p>' +
                         '          </div>' +
                         '        </div>' +
                         '      </div>' +
                         '    </div>' +
                         '    <button class="btn btn-default" onclick="window.history.back()">返回</button>' +
                         '  </div>' +
                         '</div>',
                controller: 'TransactionController'
            })
            .when('/address/:address', {
                template: '<div>' +
                         '  <h2>地址详情</h2>' +
                         '  <p><span class="monospace">{{address}}</span></p>' +
                         '  <div class="text-center" ng-if="loading">' +
                         '    <div class="spinner-border text-primary" role="status">' +
                         '      <span class="sr-only">加载中...</span>' +
                         '    </div>' +
                         '    <p>加载中...</p>' +
                         '  </div>' +
                         '  <div ng-if="!loading">' +
                         '    <div class="panel panel-default">' +
                         '      <div class="panel-heading">' +
                         '        <h3 class="panel-title">地址信息</h3>' +
                         '      </div>' +
                         '      <div class="panel-body">' +
                         '        <div class="row">' +
                         '          <div class="col-md-6">' +
                         '            <p><strong>地址:</strong> <span class="monospace">{{address}}</span></p>' +
                         '            <p><strong>余额:</strong> {{balance}} ETH</p>' +
                         '          </div>' +
                         '          <div class="col-md-6">' +
                         '            <p><strong>交易数量:</strong> {{transactionCount}}</p>' +
                         '          </div>' +
                         '        </div>' +
                         '      </div>' +
                         '    </div>' +
                         '    <button class="btn btn-default" onclick="window.history.back()">返回</button>' +
                         '  </div>' +
                         '</div>',
                controller: 'AddressController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
    
        // 运行块
      app.run(['$rootScope', '$http', '$interval', 'AppConfig', function($rootScope, $http, $interval, AppConfig) {
        console.log('应用运行');
    
        // ✅ 全局配置请求头，根治parse error(-32700)
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
        $http.defaults.headers.post['Accept'] = 'application/json';

        // 初始化全局状态
        $rootScope.connected = false;
        $rootScope.blockNumber = 0;
        $rootScope.searchInput = '';
        $rootScope.nodeUrl = AppConfig.nodeUrl;
    
        // 搜索功能
        $rootScope.search = function() {
            if (!$rootScope.searchInput || $rootScope.searchInput.trim() === '') {
                alert('请输入搜索内容');
                return;
            }
            var input = $rootScope.searchInput.trim();
            if (input.startsWith('0x')) {
                input.length === 66 ? window.location.hash = '#/transaction/' + input :
                input.length === 42 ? window.location.hash = '#/address/' + input :
                alert('请输入有效的交易哈希（66字符）或地址（42字符）');
            } else if (/^\d+$/.test(input)) {
                window.location.hash = '#/block/' + input;
            } else {
                alert('请输入交易哈希、地址或区块号');
            }
            $rootScope.searchInput = '';
        };
    
        // ✅ 修复后核心方法：无$apply、无冲突、状态自动同步
        $rootScope.checkConnection = function() {
            console.log('检查私有链连接...');
            $http({
                method: 'POST',
                url: AppConfig.nodeUrl,
                data: {jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1},
                timeout: AppConfig.connectionTimeout
            }).then(function(response) {
                if (response.data && response.data.result) {
                    var blockNum = parseInt(response.data.result, 16);
                    $rootScope.connected = true;
                    $rootScope.blockNumber = blockNum;
                    console.log('✅ 连接成功，区块高度:', blockNum);
                } else throw new Error('无效RPC响应');
            }).catch(function(error) {
                console.error('❌ 连接失败:', error);
                $rootScope.connected = false;
                $rootScope.blockNumber = 0;
            });
        };
    
        // 返回首页
        $rootScope.goHome = function() { window.location.hash = '#/'; };
    
        // 初始检查+定时轮询
        $rootScope.checkConnection();
        var checkInterval = $interval(() => $rootScope.connected && $rootScope.checkConnection(), AppConfig.refreshInterval);
        $rootScope.$on('$destroy', () => $interval.cancel(checkInterval));
    }]);
    
    // 过滤器
    app.filter('hexToDecimal', function() {
        return function(input) {
            if (!input) return '0';
            if (typeof input === 'string' && input.startsWith('0x')) {
                return parseInt(input, 16);
            }
            return input;
        };
    });
    
    app.filter('weiToEther', function() {
        return function(input) {
            if (!input) return '0 ETH';
            if (typeof input === 'string' && input.startsWith('0x')) {
                var value = parseInt(input, 16);
                return (value / 1e18).toFixed(8) + ' ETH';
            }
            return input;
        };
    });
    
    app.filter('timestampToDate', function() {
        return function(input) {
            if (!input) return '';
            var timestamp;
            if (typeof input === 'string' && input.startsWith('0x')) {
                timestamp = parseInt(input, 16);
            } else {
                timestamp = parseInt(input);
            }
            return new Date(timestamp * 1000).toLocaleString();
        };
    });
    
    // 控制器
   app.controller('MainController', ['$scope', '$rootScope', '$http', 'AppConfig', 
    function($scope, $rootScope, $http, AppConfig) {
        console.log('MainController加载');
        
        // 1. 初始化：局部作用域继承全局作用域的初始值
        $scope.connected = $rootScope.connected;
        $scope.blockNumber = $rootScope.blockNumber;
        $scope.searchInput = $rootScope.searchInput;
        $scope.loading = false;
        $scope.latestBlock = null;
        
        // 2. ✅ 核心修复：实时监听$rootScope全局状态变化 → 局部$scope立即同步
        // 监听「连接状态」变化，主区域提示文字实时跟着变
        $scope.$watch(function() { return $rootScope.connected; }, function(newVal) {
            $scope.connected = newVal;
            // 状态变为已连接时，自动刷新最新区块数据
            if(newVal) { $scope.getLatestBlock(); }
        }, true);
        
        // 监听「区块号」变化，主区域区块号实时跟着变
        $scope.$watch(function() { return $rootScope.blockNumber; }, function(newVal) {
            $scope.blockNumber = newVal;
        }, true);

        // 3. 复制根作用域的方法（不变）
        $scope.checkConnection = $rootScope.checkConnection;
        $scope.search = $rootScope.search;
        
        // 4. 获取最新区块方法（不变，保留原有逻辑）
        $scope.getLatestBlock = function() {
            if (!$scope.connected) return;
            
            $scope.loading = true;
            $http({
                method: 'POST',
                url: AppConfig.nodeUrl,
                data: {
                    jsonrpc: "2.0",
                    method: "eth_getBlockByNumber",
                    params: ["latest", true],
                    id: 1
                }
            }).then(function(response) {
                $scope.loading = false;
                if (response.data && response.data.result) {
                    $scope.latestBlock = response.data.result;
                }
            }).catch(function(error) {
                $scope.loading = false;
                console.error('获取最新区块失败:', error);
            });
        };
        
        // 5. 初始化获取区块（不变）
        if ($scope.connected) {
            $scope.getLatestBlock();
        }
    }
]);
    
    app.controller('BlockController', ['$scope', '$routeParams', '$http', 'AppConfig',
        function($scope, $routeParams, $http, AppConfig) {
            console.log('BlockController加载');
            $scope.blockId = $routeParams.blockId;
            $scope.loading = true;
            $scope.blockDetail = null;
            
            // 获取区块详情
            $http({
                method: 'POST',
                url: AppConfig.nodeUrl,
                data: {
                    jsonrpc: "2.0",
                    method: "eth_getBlockByNumber",
                    params: [$scope.blockId.startsWith('0x') ? $scope.blockId : '0x' + parseInt($scope.blockId).toString(16), true],
                    id: 1
                }
            }).then(function(response) {
                $scope.loading = false;
                if (response.data && response.data.result) {
                    $scope.blockDetail = response.data.result;
                }
            }).catch(function(error) {
                $scope.loading = false;
                console.error('获取区块失败:', error);
            });
        }
    ]);
    
    app.controller('TransactionController', ['$scope', '$routeParams', '$http', 'AppConfig',
        function($scope, $routeParams, $http, AppConfig) {
            console.log('TransactionController加载');
            $scope.txHash = $routeParams.txHash;
            $scope.loading = true;
            $scope.transaction = null;
            
            // 获取交易详情
            $http({
                method: 'POST',
                url: AppConfig.nodeUrl,
                data: {
                    jsonrpc: "2.0",
                    method: "eth_getTransactionByHash",
                    params: [$scope.txHash],
                    id: 1
                }
            }).then(function(response) {
                $scope.loading = false;
                if (response.data && response.data.result) {
                    $scope.transaction = response.data.result;
                }
            }).catch(function(error) {
                $scope.loading = false;
                console.error('获取交易失败:', error);
            });
        }
    ]);
    
    app.controller('AddressController', ['$scope', '$routeParams', '$http', 'AppConfig',
        function($scope, $routeParams, $http, AppConfig) {
            console.log('AddressController加载');
            $scope.address = $routeParams.address;
            $scope.loading = true;
            $scope.balance = '0';
            $scope.transactionCount = 0;
            
            // 获取地址余额
            $http({
                method: 'POST',
                url: AppConfig.nodeUrl,
                data: {
                    jsonrpc: "2.0",
                    method: "eth_getBalance",
                    params: [$scope.address, 'latest'],
                    id: 1
                }
            }).then(function(response) {
                if (response.data && response.data.result) {
                    $scope.balance = (parseInt(response.data.result, 16) / 1e18).toFixed(6);
                    
                    // 获取交易数量
                    return $http({
                        method: 'POST',
                        url: AppConfig.nodeUrl,
                        data: {
                            jsonrpc: "2.0",
                            method: "eth_getTransactionCount",
                            params: [$scope.address, 'latest'],
                            id: 2
                        }
                    });
                }
            }).then(function(response) {
                $scope.loading = false;
                if (response && response.data && response.data.result) {
                    $scope.transactionCount = parseInt(response.data.result, 16);
                }
            }).catch(function(error) {
                $scope.loading = false;
                console.error('获取地址信息失败:', error);
            });
        }
    ]);
    
    console.log('app.js加载完成');
})();