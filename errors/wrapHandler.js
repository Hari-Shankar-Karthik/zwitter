const wrapHandler = asyncFn => {
    return async (req, res, next) => {
        asyncFn(req, res).catch(err => {
            next(err);
        })
    }
}

module.exports = wrapHandler;