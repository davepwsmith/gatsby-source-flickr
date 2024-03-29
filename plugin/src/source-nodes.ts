import Flickr from "flickr-sdk";
import { buildFlickrPhotoNode } from "./node-builder";

import { GatsbyNode } from "gatsby";

import {
  FlickrPeopleGetPublicPhotosResponse,
  FlickrPhotosLicensesGetInfoResponse,
  IPluginOptionsInternal,
} from "./types";
import { sizes, PHOTO_NODE_TYPE } from "./constants";

export const sourceNodes: GatsbyNode["sourceNodes"] = async (
  gatsbyApi,
  pluginOptions: IPluginOptionsInternal
) => {
  const { actions, createContentDigest, createNodeId, reporter } = gatsbyApi;
  const { createNode } = actions;

  const FLICKR_API_KEY: string = pluginOptions.api_key;
  const FLICKR_USER: string = pluginOptions.username;
  const EXTRAS = pluginOptions.extras;

  // Sizes available in flickr API (NB: these are subtly different to the
  // sizes documented in flickr URLs - confusing!)
  const { THUMBS, CROPS, ORIG } = sizes;
  const all_sizes = [...THUMBS, ...CROPS, ...ORIG];

  const sourcingTimer = reporter.activityTimer(
    `Getting and Transforming photo data from Flickr`
  );
  sourcingTimer.start();

  // Expand all the sizes we want to retrieve into url param string
  const size_extras: string = all_sizes.map((size) => `url_${size}`).join();

  // Construct string of extra params for flickr API
  const extras = size_extras + EXTRAS.join();
  // Instantiate flickr sdk
  const flickr = new Flickr(FLICKR_API_KEY);

  const flickrError = (error) => {
    return sourcingTimer.panicOnBuild({
      id: `${error.code}`,
      context: {
        sourceMessage: `Sourcing from the Flickr API failed`,
        flickrError: error.message,
      },
    });
  };

  // Get a list of possible license types
  const getLicenses = async () => {
    try {
      const res_licenses = await flickr.photos.licenses.getInfo({});
      const body: FlickrPhotosLicensesGetInfoResponse = await res_licenses.body;

      const licenses = body.licenses.license;
      return licenses;
    } catch (error) {
      flickrError(error);
      return null;
    }
  };

  // Get user ID from username, which people are more likely to know
  const getUserId = async (username: string) => {
    try {
      const res = await flickr.people.findByUsername({ username: username });
      const userId: string = await res.body.user.nsid;
      return userId;
    } catch (error) {
      flickrError(error);
      return null;
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
        flickrError(error);
        // sourcingTimer.panicOnBuild(error)
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
    let photos: FlickrPeopleGetPublicPhotosResponse[] = [];

    for await (const iter of photoGenerator) {
      photos = [...photos, ...iter.photo];
    }

    return photos;
  }

  // Get 'em...
  const licenses = await getLicenses();
  const photos = await flickrPhotos();
  sourcingTimer.setStatus(`Processing ${photos.length} photos`);

  // loop through data and create Gatsby nodes
  photos.forEach((item) => {
    // Fix up the data (it's complicated...)
    const photo = buildFlickrPhotoNode(item, licenses);

    return createNode({
      ...photo,
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
  sourcingTimer.end();
};
