# EthExplorer (In Progress)

![EthExplorer Screenshot](http://i.imgur.com/NHFYq0x.png)

##License

GPL (see LICENSE)

##Installation

Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git "Git installation") if you haven't already

Clone the repo

`git clone https://github.com/etherparty/explorer`

Download [Nodejs and npm](https://docs.npmjs.com/getting-started/installing-node "Nodejs install") if you don't have them

Start the program. All dependencies will be automatically downloaded

`npm start`

Then visit http://localhost:8000 in your browser of choice. You might get an error message:

`geth --rpc --rpccorsdomain "http://localhost:8000"`

Install [geth](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum "Geth install") if you don't already have it, then run the above command.

Then refresh the page in your browser 

# 🔗 私有链区块链浏览器 - 定制化改造项目

> 基于 etherparty/explorer 开源项目的深度定制化改造，专注于私有链环境适配与功能增强。

## 🎯 项目概述

本项目是一个针对以太坊私有链环境的区块链浏览器，通过对原 `etherparty/explorer` 项目的深度改造，实现了对本地私有链的完整支持、界面定制化、以及多项功能优化。

### ✨ 主要改造亮点

| 改造方向 | 具体实现 | 效果 |
|----------|----------|------|
| **私有链适配** | 重构RPC连接逻辑，支持本地Geth节点 | 无缝连接私有链网络 |
| **UI/UX优化** | 定制深色主题、状态指示器、响应式布局 | 更直观的数据展示体验 |
| **多网络支持** | 可配置的节点切换机制 | 灵活切换不同私有链 |
| **稳定性增强** | 修复HTTP头错误、依赖兼容性问题 | 解决现代浏览器兼容问题 |
| **部署简化** | 提供一键启动脚本和详细配置指南 | 五分钟快速部署 |

## 🛠️ 技术栈

- **前端框架**: AngularJS 1.4.5 + Bootstrap 3.3.5
- **区块链交互**: Web3.js 0.14.0 (适配私有链版本)
- **开发环境**: Node.js + npm
- **私有链节点**: Geth (Go Ethereum)
- **服务器**: 原生Node.js HTTP服务器

## 🚀 快速启动

### 环境准备
1. **安装Node.js** (v14+)
2. **安装Geth客户端**
3. **克隆本项目**:
   ```bash
   git clone https://github.com/baicai1108/explorer.git
   cd explorer
