class ResponseUtil {
    /**
     * 成功响应
     * @param {any} data - 响应数据
     * @param {string} message - 响应消息
     * @returns {Object} 响应对象
     */
    static success(data = null, message = '操作成功') {
        return {
            code: 200,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 错误响应
     * @param {number} code - 错误码
     * @param {string} message - 错误消息
     * @param {any} data - 错误详情数据
     * @returns {Object} 响应对象
     */
    static error(code = 500, message = '服务器错误', data = null) {
        return {
            code,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 分页数据响应
     * @param {Array} list - 数据列表
     * @param {number} total - 总条数
     * @param {number} page - 当前页码
     * @param {number} pageSize - 每页条数
     * @returns {Object} 响应对象
     */
    static page(list, total, page, pageSize) {
        return this.success({
            list,
            pagination: {
                total,
                page,
                pageSize
            }
        });
    }
}

module.exports = ResponseUtil;