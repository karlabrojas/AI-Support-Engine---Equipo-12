const express = require("express");
const router = express.Router();

const {
  analyzeRequest
} = require("../controllers/analyze.controller");

router.post("/analyze", analyzeRequest);

module.exports = router;
