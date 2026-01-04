# webpack中Chunk与Module核心知识总结

# 一、Chunk与Module的区别与联系

## 1. 核心概念定义

### Module（模块）

webpack能够处理的最小、最基础的代码/资源单元，直接对应项目中的单个源码文件（如.js、.vue、.css、.png等）。

- 来源：项目原始源码文件，经loader转换后成为webpack可识别的“标准化模块”；

- 特征：粒度最小、不可再拆分（构建层面），是webpack构建的“原材料”。

### Chunk（代码块）

webpack打包过程中，将多个Module按一定规则聚合而成的中间代码集合，是构建阶段的产物，不直接对应项目源码。

- 来源：webpack分析模块依赖关系后，自动或手动聚合生成；

- 常见类型：入口chunk（对应entry配置）、异步chunk（动态导入生成）、公共chunk（splitChunks提取）；

- 特征：粒度更大，是多个Module的集合，最终会被输出为物理bundle文件。

## 2. 核心区别（表格汇总）

|对比维度|Module（模块）|Chunk（代码块）|
|---|---|---|
|本质与来源|最小基础单元，直接对应项目源码文件|模块聚合集合，webpack构建阶段产物|
|粒度大小|最小，不可再拆分|较大，由多个Module组成|
|存在阶段|构建早期（解析/转换阶段）|构建中后期（聚合/优化阶段）|
|核心用途|作为构建原材料，统一处理不同类型资源|用于代码分割、按需加载、缓存优化等|
|与源码对应关系|一对一（单个源码文件对应一个Module）|一对多（一个Chunk对应多个源码文件的Module）|
|最终输出关联|不直接输出，嵌入Chunk中|直接输出为物理bundle文件|
## 3. 核心联系

- Chunk依赖Module存在：所有Chunk的内容均来源于Module，无Module则无Chunk；

- 依赖关系驱动聚合：webpack通过分析Module的依赖树，将有依赖关联的Module默认聚合到同一个Chunk；

- 配置决定映射关系：entry、splitChunks、动态导入等配置可改变Module到Chunk的聚合规则；

- Chunk是中间桥梁：构建流程为“源码文件→Module→Chunk→Bundle”，Chunk承接聚合Module和生成Bundle的中间作用。

# 二、React/Vue项目中webpack打包Chunk数量的影响因素

核心结论：Chunk数量不固定，由webpack默认行为 + 手动配置共同决定，而非仅由文件依赖关系决定。

## 1. 默认配置场景（无额外优化）

### 单入口场景（React/Vue默认）

配置：entry: './src/main.js'（Vue）或 entry: './src/index.js'（React）

结果：所有Module（业务代码、第三方库、资源文件等）聚合为1个入口Chunk，最终输出1个main.js bundle；非JS资源默认嵌入该Chunk，不新增Chunk。

### 多入口场景

配置示例：

```javascript

module.exports = {
  entry: {
    app: './src/app.js', // 前台入口
    admin: './src/admin.js' // 后台入口
  }
}
```

结果：生成N个Chunk（N=入口数量），每个入口对应1个独立入口Chunk；公共依赖默认重复打包到各入口Chunk，不生成独立公共Chunk。

## 2. 实际项目自定义配置（Chunk数量增加的核心因素）

### （1）动态导入（按需加载）：新增异步Chunk

典型场景：路由懒加载，每一个动态导入的模块（及其依赖）生成1个独立异步Chunk。

示例（Vue）：

```javascript

const Home = () => import('./views/Home.vue') // 生成1个异步Chunk
const About = () => import('./views/About.vue') // 生成1个异步Chunk
```

示例（React）：

```javascript

import { lazy } from 'react'
const Home = lazy(() => import('./views/Home.jsx')) // 生成1个异步Chunk
```

### （2）splitChunks插件（代码分割）：新增公共/第三方库Chunk

作用：提取公共模块或第三方库，每提取一组新增1个独立Chunk，便于缓存优化。

常用配置示例：

```javascript

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: { // 提取第三方库到vendor Chunk
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10
        },
        commons: { // 提取公共业务模块到commons Chunk
          minSize: 0,
          minChunks: 2,
          name: 'commons'
        }
      }
    }
  }
}
```

### （3）MiniCssExtractPlugin：新增CSS Chunk

作用：将原本嵌入JS Chunk的CSS提取为独立CSS Chunk，最终输出.css文件。

效果：单入口生成1个主CSS Chunk；动态导入场景生成对应异步CSS Chunk；多入口生成多个入口CSS Chunk。

### （4）入口配置数量：基础入口Chunk数量

1个入口对应1个入口Chunk，入口数量越多，基础Chunk数量越多，叠加其他配置后总Chunk数进一步增加。

## 3. 实际项目Chunk数量示例（单入口Vue项目）

配置：单入口 + 3个动态导入路由 + splitChunks + MiniCssExtractPlugin

最终Chunk（共8个）：

1. 入口Chunk：main.js（业务入口代码）；

2. 第三方库Chunk：vendor.js（vue、vue-router等）；

3. 公共业务Chunk：commons.js（共享工具函数等）；

4. 3个异步JS Chunk：Home.js、About.js、User.js（对应路由组件及依赖）；

5. 主CSS Chunk：main.css（入口公共CSS）；

6. 异步CSS Chunk：[chunkHash].css（路由组件对应CSS）。

## 4. 核心总结

- 默认配置：单入口→1个Chunk，多入口→N个Chunk；

- 实际项目：Chunk数量通常>1，核心优化目标是实现按需加载和缓存优化，提升加载性能；

- 关键影响因素：动态导入、splitChunks配置、MiniCssExtractPlugin配置、入口数量。