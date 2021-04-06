import React, { useContext } from 'react'

import { ParentContext } from '../index'

function UseContextComponent() {
    const { param } = useContext(ParentContext)
    console.log('ParentContext: ', useContext(ParentContext));
    return (
        <div>
            <p>UseContext子组件的值：{ param }</p>
        </div>
    )
}
export default UseContextComponent


