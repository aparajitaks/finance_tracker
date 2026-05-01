exports.successResponse = (res, data, status = 200) => {
    res.status(status).json({ success: true, data });
};

exports.errorResponse = (res, msg, status = 500) => {
    res.status(status).json({ success: false, msg });
};
