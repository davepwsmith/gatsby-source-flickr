import type { GatsbyNode } from "gatsby";
import { FLICKR_ERROR_CODES } from "./constants";

export const onPluginInit: GatsbyNode[`onPluginInit`] = ({ reporter }) => {
  let errorMap = {};

  for (const key in FLICKR_ERROR_CODES) {
    errorMap = {
      ...errorMap,
      [FLICKR_ERROR_CODES[key]]: {
        text: (context) => `${context.sourceMessage}: ${context.flickrError}`,
        level: `ERROR`,
        category: `THIRD_PARTY`,
      },
    };
  }

  reporter.setErrorMap(errorMap);
};
