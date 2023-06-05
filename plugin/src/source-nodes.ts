import Flickr from "flickr-sdk";
import { fixPhoto } from "./fixflickr";

import { GatsbyNode } from "gatsby";

import { FlickrPhoto, IPluginOptionsInternal, Photo } from "./types";
import { sizes, PHOTO_NODE_TYPE } from "./constants";

export const sourceNodes: GatsbyNode["sourceNodes"] = async (
  gatsbyApi,
  pluginOptions: IPluginOptionsInternal
) => {
  const { actions, createContentDigest, createNodeId } = gatsbyApi;
  const { createNode } = actions;

  const FLICKR_API_KEY: string = pluginOptions.api_key;
  const FLICKR_USER: string = pluginOptions.username;
  const EXTRAS: Array<string> = pluginOptions.extras;

  // Sizes available in flickr API (NB: these are subtly different to the
  // sizes documented in flickr URLs - confusing!)

  // Some defaults...
  const extras_string = "description, date_taken,";

  // Expand all the sizes we want to retrieve
  let size_extras = "";
  for (const size in sizes) {
    size_extras += `height_${size}, width_${size}, url_${size},`;
  }

  // Construct string of extra params for flickr API
  const extras: string = size_extras + extras_string + EXTRAS.join();
  // Instantiate flickr sdk
  const flickr = new Flickr(FLICKR_API_KEY);

  // Get user ID from username, which people are more likely to know
  const getUserId = async (username: string) => {
    try {
      const res = await flickr.people.findByUsername({ username: username });
      const userId: string = await res.body.user.nsid;
      return userId;
    } catch (error) {
      console.warn("Error: ", error);
      return error;
    }
  };

  // Generator will iterate over paged responses until done
  async function* getPhotos(username: string, extras: string) {
    let page = 0;
    let isLast = false;

    const userId = await getUserId(username);

    while (!isLast) {
      try {
        page += 1;
        const res = await flickr.people.getPublicPhotos({
          user_id: userId,
          extras: extras,
          per_page: 100,
          page: page,
        });
        const data = await res.body.photos;
        isLast = page === data.pages;
        yield data;
      } catch (error) {
        console.warn(`exception during fetch`, error);
        yield {
          done: true,
          value: "error",
        };
      }
    }
  }

  // Use the generator to build an array of photo data

  async function flickrPhotos() {
    const photoGenerator = await getPhotos(FLICKR_USER, extras);
    let photos: FlickrPhoto[] = [];

    for await (const iter of photoGenerator) {
      photos = [...photos, ...iter.photo];
    }

    return photos;
  }

  // Get 'em...
  const photos = await flickrPhotos();

  // loop through data and create Gatsby nodes
  photos.forEach((item) => {
    // Fix up the data (it's complicated...)
    const photo: Photo = fixPhoto(item);

    return createNode({
      ...photo,
      extras: extras,
      id: createNodeId(`${PHOTO_NODE_TYPE}-${photo._id}`),
      parent: null,
      children: [],
      internal: {
        type: PHOTO_NODE_TYPE,
        content: JSON.stringify(photo),
        contentDigest: createContentDigest(photo),
      },
    });
  });

  return;
};
