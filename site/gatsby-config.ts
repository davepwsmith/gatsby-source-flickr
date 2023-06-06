import type { GatsbyConfig } from "gatsby"
import type { IPluginOptions } from "@davepwsmith/gatsby-source-flickr"

import { config } from "dotenv";

config({
  path: '.env'
})

const gatsbyConfig: GatsbyConfig = {
  siteMetadata: {
    title: `Test Site`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    {
      resolve: '@davepwsmith/gatsby-source-flickr',
      options: {
        api_key: process.env.FLICKR_API_KEY,
        username: process.env.FLICKR_USER,
        extras: [
          "description",
          "license",
          "dateUploaded",
          "dateTaken",
          "ownerName",
          "iconServer",
          "originalFormat",
          "dateLastUpdated",
          "geoData",
          "tags",
          "machineTags",
          "originalDimensions",
          "views",
          "media",
          "pathAlias"
        ]
      } satisfies IPluginOptions
    },
    'gatsby-plugin-image',
    'gatsby-transformer-sharp'
  ],
}

export default gatsbyConfig
