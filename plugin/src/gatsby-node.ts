import Flickr from "flickr-sdk";
import type { FlickrPhoto, ImageUrl, Photo } from ".";

const sizes = {
  sq: "sq_75px",
  q: "sq_150px",
  t: "_100px",
  s: "_240px",
  n: "_320px",
  m: "_500px",
  z: "_640px",
  c: "_800px",
  l: "_1024px",
  h: "_1600px",
  k: "_2048px",
  o: "original",
};

// Stolen and modified from the original gatsby-source-flickt plugin (https://github.com/chrissearle/gatsby-source-flickr)

// The flickr API has some issues when put into GraphQL - create a suitable version
const fixPhoto = (photo: FlickrPhoto): Photo => {
  const fixed: any = photo;

  // Don't name crash with node.id
  fixed.photo_id = fixed.id;
  delete fixed.id;

  // Some fields can come down as either string or number. GraphQL doesn't like that. Force everything to number

  Object.keys(sizes).forEach((suffix) => {
    if (Object.prototype.hasOwnProperty.call(fixed, `height_${suffix}`)) {
      fixed[`height_${suffix}`] = parseInt(fixed[`height_${suffix}`]);
    }
    if (Object.prototype.hasOwnProperty.call(fixed, `width_${suffix}`)) {
      fixed[`width_${suffix}`] = parseInt(fixed[`width_${suffix}`]);
    }
  });

  if (Object.prototype.hasOwnProperty.call(fixed, "accuracy")) {
    fixed.accuracy = parseInt(fixed.accuracy);
  }
  if (Object.prototype.hasOwnProperty.call(fixed, "context")) {
    fixed.context = parseInt(fixed.context);
  }

  // A missing latitude or longitude can come down as either 0 or "0" - force to number

  if (Object.prototype.hasOwnProperty.call(fixed, "latitude")) {
    fixed.latitude = parseFloat(fixed.latitude);
  }
  if (Object.prototype.hasOwnProperty.call(fixed, "longitude")) {
    fixed.longitude = parseFloat(fixed.longitude);
  }

  // These can come down as either string or number. Have only ever seen "0" and 0 here - and documentation is sparse - remove them

  if (Object.prototype.hasOwnProperty.call(fixed, "datetakengranularity")) {
    delete fixed.datetakengranularity;
  }
  if (Object.prototype.hasOwnProperty.call(fixed, "datetakenunknown")) {
    delete fixed.datetakenunknown;
  }

  // Convert Date versions of dateupload and lastupdate

  if (Object.prototype.hasOwnProperty.call(fixed, "dateupload")) {
    fixed.upload_date = new Date(fixed.dateupload * 1000);
    delete fixed.dateupload;
  }
  if (Object.prototype.hasOwnProperty.call(fixed, "lastupdate")) {
    fixed.lastupdate_date = new Date(fixed.lastupdate * 1000);
    delete fixed.lastupdate;
  }

  // Simplify the structure of the description to just a string

  if (Object.prototype.hasOwnProperty.call(fixed, "description")) {
    if (Object.prototype.hasOwnProperty.call(fixed.description, "_content")) {
      fixed.description = fixed.description._content;
    }
  }

  // arrange returned object into more sensible format (i.e. not so flat)

  fixed.imageUrls = {};
  fixed.geo = {
    permissions: {},
  };

  const geospatial = [
    "longitude",
    "latitude",
    "geo_is_public",
    "geo_is_family",
    "geo_is_friend",
    "geo_is_contact",
    "accuracy",
    "context",
    "place_id",
    "woeid",
  ];

  for (const property in fixed) {
    const lastElem = property.toString().split("_").pop();
    const firstElem = property.toString().split("_").shift();

    if (firstElem && lastElem && Object.keys(sizes).includes(lastElem)) {
      const sizeKey = sizes[lastElem];
      const newElem =
        firstElem === "url"
          ? { [firstElem]: fixed[property] }
          : { [firstElem]: fixed[property] };
      fixed.imageUrls[sizeKey] = { ...fixed.imageUrls[sizeKey], ...newElem };
      delete fixed[property];
    }

    // Add orientation

    for (const image in fixed.imageUrls) {
      if (Object.prototype.hasOwnProperty.call(fixed.imageUrls, image)) {
        const element: ImageUrl = fixed.imageUrls[image];

        element.orientation =
          element.width === element.height
            ? "square"
            : element.width > element.height
            ? "landscape"
            : "portrait";
      }
    }

    if (geospatial.includes(property)) {
      if (firstElem && firstElem === "geo") {
        fixed.geo.permissions[property.toString().substring(4)] =
          fixed[property];
      } else {
        fixed.geo[property] = fixed[property];
      }
      delete fixed[property];
    }
  }

  // delete some useless info:
  // * we use getPublicPhotos so we already know photos
  // are public and we have URLs for the photos in the response)
  // * various server/farm references seem pointless when you have URLs
  // * owner/username are stipuated in the plugin settings - might bring
  // these back if functionality is added to get photos from different places
  // * secret... not sure what these are for!

  delete fixed.server;
  delete fixed.farm;
  delete fixed.iconserver;
  delete fixed.iconfarm;
  delete fixed.ispublic;
  delete fixed.isfriend;
  delete fixed.isfamily;
  delete fixed.owner;
  delete fixed.secret;

  return fixed;
};

const pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    // Validate that the anonymize option is defined by the user and is a boolean
    api_key: Joi.string().required(),
    username: Joi.string().required(),
    extras: Joi.array().items(Joi.string()).optional(),
  });
};

const sourceNodes = async (
  { actions, createContentDigest, createNodeId },
  pluginOptions
) => {
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
  const flickr = new Flickr(FLICKR_API_KEY, {});

  // Get user ID from username, which people are more likely to know
  const getUserId = async (username: string) => {
    try {
      const res = await flickr.people.findByUsername({ username: username });
      const userId: string = await res.body.user.nsid;
      return userId;
    } catch (error) {
      console.warn("Error: ", error);
      return error
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

  // constants for your GraphQL Post and Author types
  const PHOTO_NODE_TYPE = `FlickrPhoto`;

  // Get 'em...
  const photos = await flickrPhotos();

  // loop through data and create Gatsby nodes
  photos.forEach((item) => {
    // Fix up the data (it's complicated...)
    const photo: Photo = fixPhoto(item);

    return createNode({
      ...photo,
      id: createNodeId(`${PHOTO_NODE_TYPE}-${photo.photo_id}`),
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

export { pluginOptionsSchema, sourceNodes };
