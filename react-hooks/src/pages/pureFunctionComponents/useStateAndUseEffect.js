import { useState, useEffect } from 'react'

/* eslint-disable */
function PureFunction () {
    const [num, setNum] = useState(0)
    const [initState, setInitState] = useState({ data: 0 })
    let timer = null
    function changeData() {

        // initState
        setInitState({ data: 5, data1: 7 })
        // 因为hooks的执行式异步的，所以这里第一次点击的时候会是初始值
        console.log('initState:', initState);
        timer = setTimeout(() => {
            // 这里也是保留了 initState 的初始值 形成了闭包
            console.log('setTimeout之后的initState', initState);
        }, 0);


        // num
        /**
         * @description
         * 1、先分别生成了两个新的num，数值上都等于num+1（即1），但彼此无关
         * 2、分别进行了render，而只有最新一次render无效，此次render援用了最初一次setN函数里生成的n。
         * */
        // setNum(num + 1)
        // setNum(num + 1)
        
        /**
         * @description
         * 1、接管的函数 n => n + 1 并未放弃对n的援用，而是表白了一种 加1 操作
         * 2、举荐应用函数代码进行 setState
         */
        setNum(n => n + 1)
        setNum(n => n + 1)
    }
    // 副作用函数
    /**
     * @description
     * 1、第二个参数就是控制 useEffect hook 的执行时机，不传每次页面渲染都会执行
     * 2、传空数组直在页面首次渲染时执行
     * 3、再离开组件时可以执行销毁清除的操作
     */
    useEffect(() => {
        console.log('useEffect里面的initState：', initState);
        console.log('useEffect里面的num：', num);
        // 这里相当于 class组件 里面的 componentWillUnmount，一般再这里清除定时器
        return () => {
            console.log('00000000000000000000000');
            clearTimeout(timer)
        }
    }, [num, initState])


    return (
        <div>
            <p>{ initState.data }</p>
            <button onClick={ changeData }>改变数据</button>
        </div>
    )
}
export default PureFunction