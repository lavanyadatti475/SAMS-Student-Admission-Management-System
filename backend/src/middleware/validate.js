const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({ success: false, errors: error.errors || err.issues || err.message });
      }
      return next(error);
    }
  };
}

module.exports = validate;
