const errorHandler = (err, req, res, next) => {
  console.log(err);
  res.sendStatus(200);
};

export { errorHandler };
