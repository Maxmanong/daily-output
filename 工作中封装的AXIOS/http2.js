import axios from "axios";
import { MessageBox } from "element-ui";
let ENV = process.env.NODE_ENV
// axios.defaults.baseURL = ENV === 'production' ? 'http://183.224.28.137:38083/pda-diagnose' : '/api'
// axios.defaults.baseURL = ENV === 'production' ? 'http://10.2.0.170:38083/pda-diagnose' : '/api'
axios.defaults.baseURL = ENV === 'production' ? window.SITE_CONFIG.baseUrl : '/api'
// axios.defaults.headers.post['Content-Type'] = 'application/json';
var HttpRequest = {
    $axios({
        url,
        data = {},
        method = "GET",
        BASE_URL = ''
    }) {
        return new Promise((resolve, reject) => {
            this.requestMethod(url, resolve, reject, data, method, BASE_URL);
        });
    },
    requestMethod: function (url, resolve, reject, data = {}, method = "GET", BASE_URL) {
        let format = method.toLocaleLowerCase() === 'get' ? 'params' : 'data';
        axios({
            url: BASE_URL + url,
            method: method,
            [format]: data,
            header: {
                "content-type": "application/json"
                // "content-type": "application/x-www-form-urlencoded"
            }
        }).then(res => {
            // console.log('数据：', res)
            // MessageBox({
            //     message: "请求成功",
            //     type: 'success'
            // })
            if (res.status == 200) {
                resolve(res.data);
            } else {
                reject(res)
            }
        }).catch(() => {
            // console.log('url: ', url, 'method: ', method, 'data: ', data)
            reject();
            MessageBox({
                message: "发生错误，请检查！",
                type: 'error'
            });
        })
    }
};
export {
    HttpRequest
};