import type { GatsbyNode } from "gatsby";
import type { ObjectSchema } from "gatsby-plugin-utils";
import { extras } from './constants'

const validExtras = Object.keys(extras)

export const pluginOptionsSchema: GatsbyNode["pluginOptionsSchema"] = ({
  Joi,
}): ObjectSchema => {
  return Joi.object({
    // Validate that the anonymize option is defined by the user and is a boolean
    api_key: Joi.string().required().description("Your Flickr API Key"),
    username: Joi.string().required().description("Your Flickr username"),
    extras: Joi.array()
      .items(Joi.string().valid(...validExtras))
      .optional()
      .description("An array of options to send to the flickr REST API"),
  });
};
