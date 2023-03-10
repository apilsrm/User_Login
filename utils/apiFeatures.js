const { json } = require("express");

class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  //search

  search() {
    const keyword = this.queryStr.keyword
      ? {
          productName: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    // console.log(keyword); ... speed operator
    this.query = this.query.find({ ...keyword });
    return this;
  }
  //filters methods
  filter() {
    const queryCopy = { ...this.queryStr };

    //removing
    const removeFields = ["keyword ", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    //for price and rating filters
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)b/g, (key) => `$${key}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  //for pagination
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
