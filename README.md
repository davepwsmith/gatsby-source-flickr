# gatsby-source-flickr

This source plugin for Gatsby will make images from [Flickr](https://flickr.com/) available in GraphQL queries.

## Installation

```sh
# Install the plugin
yarn add gatsby-source-flickr
```

In `gatsby-config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-flickr",
      options: {
        api_key: "YOUR_FLICKR_API_KEY",
        username: "YOUR_FLICKR_USERNAME",
      },
    },
  ],
};
```

**NOTE:** To get a Flickr API key, [register for a Flickr account](https://www.flickr.com/signup). You will then need to create a [Flickr API app](https://www.flickr.com/services/apps/create/).

## Configuration Options

The plugin uses the people.getPublicPhotos endpoint, and will add sane, restrained defaults.

- [Flickr API call options](https://www.flickr.com/services/api/flickr.people.getPublicPhotos.html).

The `api_key` and `username` options are required.

If you want to add any other "extras" to this from the API above, you can include them in an array on the extras key (example below)

### Example Configuration

This would retrieve all photos for a given user id.

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-flickr",
      options: {
        api_key: process.env.FLICKR_API_KEY,
        username: process.env.FLICKR_USER,
        extras: ["geo"],
      },
    },
  ],
};
```

## Querying Flickr Images

Once the plugin is configured, two new queries are available in GraphQL: `allFlickrPhoto` and `flickrPhoto`.

Here’s an example query to load 10 images:

```gql
query PhotoQuery {
  allFlickrPhoto(limit: 10) {
   nodes {
        id
        title
        description
        tags
        imageUrls {
        _1024px {
          url
        }
        _500px {
          url
        }
        sq_150px {
          url
        }
        _320px {
          url
        }
      }
      }
    }
  }
}
```
