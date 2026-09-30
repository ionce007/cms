const PAGE_TYPES = {
  ARTICLE: 0,
  CODE: 1,
  BULLETIN: 2,
  DISCUSS: 3,
  LINKS: 4,
  RAW: 5,
  MEDIA: 6,
  TIMELINE: 7,
  REDIRECT: 8,
  TEXT: 9
};

const PAGE_STATUS = {
  RECALLED: 0,
  PUBLISHED: 1,
  TOPPED: 2,
  HIDDEN: 3
};

const FORMULA_KIND = {
  ZBGS: "指标公式",
  XGGS: "选股公式",
  CZSM: "操作说明",
  JYFX: "经验分享"
};
const FORMULA_CATEGORY = {
  VIDEO: 1,
  AUDIO: 2,
  IMAGE: 3,
  DOCUMENT: 4,
  APP: 5,
  OTHERS: 6,
  SEEK: 7
};

module.exports = { PAGE_TYPES, PAGE_STATUS, FORMULA_KIND, FORMULA_CATEGORY };
