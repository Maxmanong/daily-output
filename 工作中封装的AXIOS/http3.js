/**
 * 全站http配置
 *
 * axios参数说明
 * isSerialize是否开启form表单提交
 * isToken是否需要token
 */
import axios from "axios";
import store from "@/store/";
import {
    serialize
} from "@/util/util";
import {
    getToken
} from "@/util/auth";
import {
    Message
} from "element-ui";
import website from "@/config/website";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
// NProgress Configuration
NProgress.configure({
    showSpinner: false,
});

const mainService = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    //返回其他状态吗
    validateStatus: function (status) {
        return status >= 200 && status <= 500; // 默认的
    },
    //跨域请求，允许保存cookie
    // withCredentials: true,
    // 请求超时时间
    timeout: 10000,
});

//HTTPrequest拦截
mainService.interceptors.request.use(
    (config) => {
        NProgress.start(); // start progress bar
        const meta = config.meta || {};
        const isToken = meta.isToken === false;
        if (getToken() && !isToken) {
            config.headers["token"] = getToken(); // 让每个请求携带token--['Authorization']为自定义key 请根据实际情况自行修改
        }

        if (config.data && config.data.date) {
            config.data.kssj = config.data.date[0]
            config.data.jssj = config.data.date[1]
        }

        //headers中配置serialize为true开启序列化
        if (config.method === "post" && meta.isSerialize === true) {
            config.data = serialize(config.data);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
//HTTPresponse拦截
mainService.interceptors.response.use(
    (res) => {
        console.log("[response]", res);
        NProgress.done();
        const status = Number(res.status) || 200;
        const statusWhiteList = website.statusWhiteList || [];
        var message = res.data.message || "未知错误";
        //如果在白名单里则自行catch逻辑处理
        if (statusWhiteList.includes(status)) return Promise.reject(res);

        switch (status) {
            case 200:
                message = res.data.retMsg;
                break;
            case 400:
                message = "错误请求";
                break;
            case 401:
                //如果是401则跳转到登录页面
                store.dispatch("FedLogOut").then(() => {
                    // 跳转
                });
                break;
            case 404:
                message = "请求地址不存在";
                break;
            case 500:
                message = "服务器内部错误";
                break;
            default:
                break;
        }

        // 如果请求为非200否者默认统一处理
        if (res.data.retCode && res.data.retCode != "0") {
            if (res.data.retCode == 6666) {
                Message({
                    message: message,
                    type: "error",
                    duration: 0,
                    showClose: true
                });
            } else {
                Message({
                    message: message,
                    type: "error",
                });
            }
            if (res.data.retCode == 7777 || res.data.retCode == 5555) {
                store.dispatch("FedLogOut").then(() => {
                    // 
                });
            }
            return Promise.reject(new Error(message));
        }
        return res;
    },
    (error) => {
        NProgress.done();
        return Promise.reject(new Error(error));
    }
);

export default mainService;
