
# gatsby-source-flickr

This source plugin for Gatsby will make images from [Flickr](https://flickr.com/) available in GraphQL queries.

## Installation

```sh
# Install the plugin
npm install @davepwsmith/gatsby-source-flickr
```

In `gatsby-config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: "@davepwsmith/gatsby-source-flickr",
      options: {
        api_key: "YOUR_FLICKR_API_KEY",
        username: "YOUR_FLICKR_USERNAME",
      },
    },
  ],
};
```
It is recommended to store the API key and Username as environment variables, so that they are not exposed in the app.

**NOTE:** To get a Flickr API key, [register for a Flickr account](https://www.flickr.com/signup). You will then need to create a [Flickr API app](https://www.flickr.com/services/apps/create/).

## Configuration Options

The plugin uses the `people.getPublicPhotos` endpoint, and will add sane, restrained defaults.

- [Flickr API call options](https://www.flickr.com/services/api/flickr.people.getPublicPhotos.html).

The `api_key` and `username` options are required.

In order to retrieve less information where possible, the plugin allows you to specify extras as per the Flickr API call options
If you want to add any other "extras" to this from the API above, you can include them in an array on the extras key (example below). 
**N.B.:** There is no need to include photo urls or dimensions as extras, as these are already included by default.

### Example Configuration

This would retrieve all photos for a given user id, and include location data.

```js
module.exports = {
  plugins: [
    {
      resolve: "@davepwsmith/gatsby-source-flickr",
      options: {
        api_key: process.env.FLICKR_API_KEY,
        username: process.env.FLICKR_USER,
        extras: ["description", "geoData"],
      },
    },
  ],
};
```

## Querying Flickr Images

Once the plugin is configured, two new queries are available in GraphQL: `allFlickrPhoto` and `flickrPhoto`.

The nodes will have the following fields by default:

`_id`
`owner`
`title`
`images`
`thumbnails`

Any extras will add further nodes specific to those extras. 

Images can be accessed using much of the standard gatsbyImageData API which gatsby-plugin-image provides. An example below shows how
you could fetch an image in square format by specifying height and width. Check out the 
[`gatsby-plugin-image` documentation](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/) for
more information on available parameters.

```graphql
query PhotoQuery {
  allFlickrPhoto(limit: 10) {
   nodes {
        id
        title
        description
        gatsbyImageData(
          width: 300,
          height: 300
        )
        
      }
    }
  }
```
