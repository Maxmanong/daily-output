import axios from "axios";
import { Message } from "view-design";

axios.defaults.timeout = 300000;
// 线上
axios.defaults.baseURL = "/nmca/managerview-networkfee";
// axios.defaults.baseURL = '/api';

// download url
// const downloadUrl = (url) => {
//   let iframe = document.createElement("iframe");
//   iframe.style.display = "none";
//   iframe.src = url;
//   console.log("downloadUrl:" + url);
//   iframe.onload = function () {
//     document.body.removeChild(iframe);
//   };
//   document.body.appendChild(iframe);
// };

// http request 拦截器
axios.interceptors.request.use(
    (config) => {
        // alert(JSON.stringify(config));
        config.headers["Content-Type"] = "application/json;charset=UTF-8";
        if (config.url.indexOf("login") < 0) {
            var userToken = window.sessionStorage.getItem("token");
            var userId = window.sessionStorage.getItem("userId");
            config.headers["X-Auth-Token"] = userToken;
            config.headers["X-User-Id"] = userId;
            if (config.url.indexOf("export") > 0) {
                //文件导出
                config.responseType = "arraybuffer";
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// http response 拦截器
axios.interceptors.response.use(
    async (response) => {
        // console.log('response---',response.data);
        if (response.data.result && response.data.result > 0) {
            Message.error({
                content: response.data.errorDesc,
                duration: 5,
            });
            return Promise.reject(response);
        }
        let reloadData;
        if (
            response.config.data != undefined &&
            response.config.method == "post" &&
            !response.data.error &&
            response.config.url.indexOf("search") > -1 &&
            typeof response.config.data == "string" &&
            response.config.data.indexOf("pageNum") > -1 &&
            response.config.data.indexOf("pageSize") > -1
        ) {
            let requestParams = JSON.parse(response.config.data);
            if (
                requestParams.pageNum != undefined &&
                requestParams.pageSize != undefined
            ) {
                if (
                    response.data.content.pages != null &&
                    response.data.content.pages != undefined &&
                    response.data.content.pages != 0 &&
                    requestParams.pageNum > response.data.content.pages
                ) {
                    console.info("请求页码大于总页码，需要重置请求到第一页。");
                    requestParams.pageNum = 1;
                    if (response.config.method == "post") {
                        await post(
                            response.config.url.replace(response.config.baseURL, ""),
                            requestParams
                        ).then((data) => {
                            reloadData = data;
                        });
                    } else if (response.config.method == "get") {
                        await get(
                            response.config.url.replace(response.config.baseURL, ""),
                            requestParams
                        ).then((data) => {
                            reloadData = data;
                        });
                    }
                }
            }
        }
        // 处理excel文件
        if (
            response.headers &&
            (response.headers["content-type"] === "application/x-msdownload" ||
                response.headers["content-type"] === "application/vnd.ms-excel" ||
                response.headers["content-type"] === "application/octet-stream")
        ) {
            var fileName = response.headers["content-disposition"];
            fileName = fileName
                .substr(fileName.indexOf("filename="), fileName.length)
                .replace("filename=", "");
            fileName = decodeURI(fileName);
            var blob = new Blob([response.data], {
                type: "text/plain;charset=UTF-8",
            });
            var downloadElement = document.createElement("a");
            var href = window.URL.createObjectURL(blob); //创建下载的链接
            downloadElement.href = href;
            downloadElement.download = fileName; //response.headers['filename']; //下载后文件名
            document.body.appendChild(downloadElement);
            downloadElement.click(); //点击下载
            document.body.removeChild(downloadElement); //下载完成移除元素
            window.URL.revokeObjectURL(href); //释放掉blob对象
            return response.data;
        }
        if (reloadData != null && reloadData != undefined) {
            response.data = reloadData;
        }
        return response;
    },
    (error) => {
        // console.log('error:' + JSON.stringify(error))
        let msg;
        // const status = error.response['status'] || 0
        const status = error.response ? error.response["status"] || 0 : 0;
        if (status == 401) {
            let params = {
                type: "401",
                data: {},
            };
            // msg = "用户没有登陆，请登陆后再试！";
            window.parent.top.postMessage(params, "*");
        } else {
            if (status >= 400 && status < 500) {
                msg = "服务器尚未提供该能力:" + error.response["config"]["url"];
            } else if (status >= 500 && status < 600) {
                msg = "服务器内部错误";
            } else {
                msg = "未知错误:" + status;
            }
        }
        Message.error({
            content: msg,
            duration: 5,
        });
        return Promise.reject(error);
    }
);

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

export function get(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                params: params,
            })
            .then((response) => {
                resolve(response.data);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, data).then(
            (response) => {
                resolve(response.data);
            },
            (err) => {
                reject(err);
            }
        );
    });
}

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function patch(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.patch(url, data).then(
            (response) => {
                resolve(response.data);
            },
            (err) => {
                reject(err);
            }
        );
    });
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function put(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.put(url, data).then(
            (response) => {
                resolve(response.data);
            },
            (err) => {
                reject(err);
            }
        );
    });
}
