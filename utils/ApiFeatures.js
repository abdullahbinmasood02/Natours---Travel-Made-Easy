class APIFeatures {
  //query e.g => Tour.find() queryString => req.query
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };

    const excluded = ['page', 'sort', 'limit', 'fields'];
    excluded.forEach((el) => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      let sortStr = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortStr);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  fields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    //pagination

    const limit = this.queryStr.limit * 1 || 100;
    const page = this.queryStr.page * 1 || 1;

    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
