// backend/src/middleware/validate.js
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      });
    }
    req.body = value;
    next();
  };
};

module.exports = { validate };