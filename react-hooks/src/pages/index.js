import React, { Component, createContext } from 'react'

import UseStateAndUseEffect from './pureFunctionComponents/useStateAndUseEffect'
import UseContextComponent from './pureFunctionComponents/useContext' 


// 1、创建上下文并导出
export const ParentContext = createContext()
ParentContext.displayName = 'ParentContext'

class Index extends Component {
    constructor() {
        super()
        this.state = {
            param: '父组件传递的参数！'
        }
    }
    render() {
        const param = this.state.param
        return (
            <React.Fragment>
                <div>
                    <h2>首页</h2>
                </div>
                <div>
                    <h3> ------------------------- </h3>
                    <h3>{`钩子：useState && useEffect`}</h3>
                    <UseStateAndUseEffect></UseStateAndUseEffect>
                    <h3> ------------------------- </h3>
                    <h3>{`钩子：useContext`}</h3>
                    {/* 2、使用 ParentContext.Provider 包裹着需要使用到 父组件内数据的子组件，
                    并将数据通过value传入 */}
                    <ParentContext.Provider value={{ param }}>
                        <UseContextComponent></UseContextComponent>
                    </ParentContext.Provider>
                    <h3> ------------------------- </h3>
                </div>
            </React.Fragment>
        )
    }
}

export default Index